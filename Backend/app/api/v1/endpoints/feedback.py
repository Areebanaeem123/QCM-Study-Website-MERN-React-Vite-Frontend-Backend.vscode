from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.pack_review import PackReview
from app.models.mock_exam_review import MockExamReview
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

# 🔐 Only Pack Creators & Admins
def require_pack_creator_or_admin(user: User = Depends(get_current_user)):
    if user.rank not in [5, 6]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return user

# ================= PACK FEEDBACK =================
@router.get("/packs")
def list_pack_feedback(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_pack_creator_or_admin)
):
    reviews = db.query(PackReview).order_by(PackReview.created_at.desc()).all()

    return [
        {
            "review_id": r.id,
            "pack_id": r.pack_id,
            "student_id": r.student_id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at
        }
        for r in reviews
    ]


# ================= MOCK EXAM FEEDBACK =================
@router.get("/mock-exams")
def list_mock_exam_feedback(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_pack_creator_or_admin)
):
    reviews = db.query(MockExamReview).order_by(MockExamReview.created_at.desc()).all()
    return [
        {
            "review_id": r.id,
            "mock_exam_id": r.mock_exam_id,
            "student_id": r.student_id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at
        }
        for r in reviews
    ]
