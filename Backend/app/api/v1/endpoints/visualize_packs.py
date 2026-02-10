from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.pack import Pack
from app.models.pack_purchase import PackPurchase
from app.models.pack_review import PackReview
from app.schemas.pack import PackOut, PackStudentOut
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

def require_pack_creator_or_admin(current_user: User = Depends(get_current_user)):
    if current_user.rank not in [5, 6]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

# --- List all packs filtered by university ---
@router.get("/", response_model=List[PackOut])
def list_packs(
    university_id: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_pack_creator_or_admin)
):
    query = db.query(Pack)
    if university_id:
        query = query.filter(Pack.university_id == university_id)
    return query.order_by(Pack.created_at.desc()).all()

# --- Get students who bought a pack ---
@router.get("/{pack_id}/students", response_model=List[PackStudentOut])
def pack_students(
    pack_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_pack_creator_or_admin)
):
    pack = db.query(Pack).filter_by(id=pack_id).first()
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    purchases = db.query(PackPurchase).filter_by(pack_id=pack.id).all()
    return [
        PackStudentOut(
            student_id=p.student_id,
            student_name=f"{p.student.first_name} {p.student.last_name}",
            purchased_at=p.purchased_at,
            gifted=p.gifted
        )
        for p in purchases
    ]

# --- Gift or revoke pack access ---
@router.post("/{pack_id}/gift/{student_id}")
def gift_pack(
    pack_id: str,
    student_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_pack_creator_or_admin)
):
    purchase = db.query(PackPurchase).filter_by(pack_id=pack_id, student_id=student_id).first()
    if purchase:
        purchase.gifted = True
    else:
        new_purchase = PackPurchase(pack_id=pack_id, student_id=student_id, gifted=True)
        db.add(new_purchase)
    db.commit()
    return {"detail": "Pack gifted successfully"}

@router.post("/{pack_id}/revoke/{student_id}")
def revoke_pack(
    pack_id: str,
    student_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_pack_creator_or_admin)
):
    purchase = db.query(PackPurchase).filter_by(pack_id=pack_id, student_id=student_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    db.delete(purchase)
    db.commit()
    return {"detail": "Pack access revoked successfully"}

# --- View pack evaluation/reviews ---
@router.get("/{pack_id}/reviews")
def pack_reviews(
    pack_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_pack_creator_or_admin)
):
    reviews = db.query(PackReview).filter_by(pack_id=pack_id).all()
    return [
        {
            "student_name": f"{r.student.first_name} {r.student.last_name}",
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at
        }
        for r in reviews
    ]
