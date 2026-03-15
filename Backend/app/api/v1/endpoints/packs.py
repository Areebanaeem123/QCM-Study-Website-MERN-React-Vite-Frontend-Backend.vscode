from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models.user import User
from app.models.pack import Pack
from app.models.pack_mcq import PackMCQ
from app.models.session import Session as PackSession
from app.models.mcq import MCQ
from app.models.university import University
from app.schemas.pack import PackCreate, PackUpdate, PackResponse
from app.api.v1.endpoints.auth import get_current_user, require_admin, require_pack_manager

router = APIRouter()


# ---------------------------------------------------------
# CREATE PACK / MOCK EXAM
# ---------------------------------------------------------
@router.post("/", response_model=PackResponse, status_code=status.HTTP_201_CREATED)
def create_pack(
    pack_data: PackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_pack_manager)
):
    university = db.query(University).filter_by(id=pack_data.university_id).first()
    if not university:
        raise HTTPException(status_code=404, detail="University not found")

    creator_name = f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or current_user.email

    pack = Pack(
        university_id=pack_data.university_id,
        type=pack_data.type,
        title=pack_data.title,
        description=pack_data.description,
        price=pack_data.price,
        currency=pack_data.currency,
        time_limit_minutes=pack_data.time_limit_minutes,
        is_visible_before_start=pack_data.is_visible_before_start,
        status=pack_data.status,
        created_by=current_user.id,
        creator_name=creator_name
    )

    db.add(pack)
    db.flush()

    # Add session
    session = PackSession(
        pack_id=pack.id,
        start_time=pack_data.session.start_time,
        end_time=pack_data.session.end_time
    )
    db.add(session)

    # Add MCQs
    for index, mcq_item in enumerate(pack_data.mcqs):
        mcq = db.query(MCQ).filter_by(id=mcq_item.mcq_id, status="approved").first()
        if not mcq:
            raise HTTPException(status_code=400, detail=f"MCQ {mcq_item.mcq_id} not found or not approved")

        pack_mcq = PackMCQ(
            pack_id=pack.id,
            mcq_id=mcq.id,
            position=index + 1
        )
        db.add(pack_mcq)

    db.commit()
    db.refresh(pack)
    return pack


# ---------------------------------------------------------
# LIST PACKS
# ---------------------------------------------------------
@router.get("/", response_model=List[PackResponse])
def list_packs(
    university_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Pack).filter(
        Pack.is_published == True,
        Pack.type == "pack"
    )

    if university_id:
        query = query.filter(Pack.university_id == university_id)

    return query.order_by(Pack.created_at.desc()).all()


# ---------------------------------------------------------
# GET SINGLE PACK
# ---------------------------------------------------------
@router.get("/{pack_id}", response_model=PackResponse)
def get_pack(
    pack_id: str,
    db: Session = Depends(get_db)
):
    pack = db.query(Pack).filter_by(id=pack_id, is_published=True).first()
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    # In a real app, we might want to attach more computed fields here 
    # if the schema doesn't already handle them via relationships.
    return pack


# ---------------------------------------------------------
# UPDATE PACK
# ---------------------------------------------------------
@router.put("/{pack_id}", response_model=PackResponse)
def update_pack(
    pack_id: str,
    pack_data: PackUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_pack_manager)
):
    pack = db.query(Pack).filter_by(id=pack_id).first()
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")

    for field, value in pack_data.dict(exclude_unset=True).items():
        setattr(pack, field, value)

    db.commit()
    db.refresh(pack)
    return pack


# ---------------------------------------------------------
# DELETE PACK
# ---------------------------------------------------------
@router.delete("/{pack_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pack(
    pack_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_pack_manager)
):
    pack = db.query(Pack).filter_by(id=pack_id).first()
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")

    db.delete(pack)
    db.commit()
