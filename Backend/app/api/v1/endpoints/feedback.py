from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.pack_review import PackReview
from app.models.mock_exam_review import MockExamReview
from app.api.v1.endpoints.auth import get_current_user

from app.models.pack import Pack
from app.models.mock_exam import MockExam

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
    reviews = db.query(
        PackReview, 
        User.first_name, 
        User.last_name, 
        Pack.title
    ).join(User, PackReview.student_id == User.id)\
     .join(Pack, PackReview.pack_id == Pack.id)\
     .order_by(PackReview.created_at.desc()).all()

    return [
        {
            "review_id": r.PackReview.id,
            "pack_id": r.PackReview.pack_id,
            "student_id": r.PackReview.student_id,
            "student_name": f"{r.first_name} {r.last_name}",
            "item_title": r.title,
            "rating": r.PackReview.rating,
            "comment": r.PackReview.comment,
            "created_at": r.PackReview.created_at
        }
        for r in reviews
    ]


# ================= MOCK EXAM FEEDBACK =================
@router.get("/mock-exams")
def list_mock_exam_feedback(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_pack_creator_or_admin)
):
    reviews = db.query(
        MockExamReview, 
        User.first_name, 
        User.last_name, 
        MockExam.title
    ).join(User, MockExamReview.user_id == User.id)\
     .join(MockExam, MockExamReview.mock_exam_id == MockExam.id)\
     .order_by(MockExamReview.created_at.desc()).all()

    return [
        {
            "review_id": r.MockExamReview.id,
            "mock_exam_id": r.MockExamReview.mock_exam_id,
            "student_id": r.MockExamReview.user_id,
            "student_name": f"{r.first_name} {r.last_name}",
            "item_title": r.title,
            "rating": r.MockExamReview.rating,
            "comment": r.MockExamReview.comment,
            "created_at": r.MockExamReview.created_at
        }
        for r in reviews
    ]
