from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models import Pack, MCQ, PackMCQ, User
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()
# 🔐 Only Rank 5 & 6
def require_pack_creator(user: User):
    if user.rank not in [5, 6]:
        raise HTTPException(status_code=403, detail="Not authorized")
# 1️⃣ Add MCQ to Pack
@router.post("/{pack_id}/add/{mcq_id}")
def add_mcq_to_pack(
    pack_id: int,
    mcq_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    require_pack_creator(user)

    pack = db.query(Pack).filter(Pack.id == pack_id).first()
    mcq = db.query(MCQ).filter(MCQ.id == mcq_id).first()

    if not pack or not mcq:
        raise HTTPException(status_code=404, detail="Pack or MCQ not found")

    existing = db.query(PackMCQ).filter_by(pack_id=pack_id, mcq_id=mcq_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="MCQ already in pack")

    link = PackMCQ(pack_id=pack_id, mcq_id=mcq_id)
    db.add(link)
    db.commit()

    return {"message": "MCQ added to pack successfully"}


# 2️⃣ Remove MCQ from Pack
@router.delete("/{pack_id}/remove/{mcq_id}")
def remove_mcq_from_pack(
    pack_id: int,
    mcq_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    require_pack_creator(user)

    link = db.query(PackMCQ).filter_by(pack_id=pack_id, mcq_id=mcq_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="MCQ not in pack")

    db.delete(link)
    db.commit()

    return {"message": "MCQ removed from pack"}


# 3️⃣ View MCQs inside a Pack
@router.get("/{pack_id}")
def get_pack_mcqs(
    pack_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    require_pack_creator(user)

    mcqs = (
        db.query(MCQ)
        .join(PackMCQ, MCQ.id == PackMCQ.mcq_id)
        .filter(PackMCQ.pack_id == pack_id)
        .all()
    )

    return mcqs
