from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.mock_exam import MockExam
from app.models.university import University
from app.models.mock_exam_purchase import MockExamPurchase
from app.models.mock_exam_review import MockExamReview
from app.schemas.mock_exam import MockExamOut, MockExamStudentOut
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()
def require_writer_or_admin(user: User):
    if user.rank not in [5, 6]:
        raise HTTPException(status_code=403, detail="Not authorized")

@router.get("/", response_model=List[MockExamOut])
def list_mock_exams(
    university_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_writer_or_admin(current_user)

    exams = db.query(
        MockExam,
        func.count(MockExamPurchase.id).label("times_sold")
    ).outerjoin(
        MockExamPurchase, MockExam.id == MockExamPurchase.mock_exam_id
    ).filter(
        MockExam.university_id == university_id
    ).group_by(MockExam.id).all()

    return [
        {
            "id": exam.MockExam.id,
            "title": exam.MockExam.title,
            "description": exam.MockExam.description,
            "created_at": exam.MockExam.created_at,
            "times_sold": exam.times_sold
        }
        for exam in exams
    ]

@router.get("/{exam_id}/students", response_model=List[MockExamStudentOut])
def get_students_for_mock_exam(
    exam_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_writer_or_admin(current_user)

    students = db.query(User).join(
        MockExamPurchase,
        MockExamPurchase.user_id == User.id
    ).filter(
        MockExamPurchase.mock_exam_id == exam_id,
        MockExamPurchase.access_granted == True
    ).all()

    return students

@router.post("/{exam_id}/gift/{user_id}")
def gift_mock_exam(
    exam_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_writer_or_admin(current_user)

    purchase = MockExamPurchase(
        user_id=user_id,
        mock_exam_id=exam_id,
        gifted=True,
        access_granted=True
    )
    db.add(purchase)
    db.commit()

    return {"message": "Mock exam gifted successfully"}


@router.post("/{exam_id}/deny/{user_id}")
def deny_mock_exam_access(
    exam_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_writer_or_admin(current_user)

    purchase = db.query(MockExamPurchase).filter_by(
        mock_exam_id=exam_id,
        user_id=user_id
    ).first()

    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")

    purchase.access_granted = False
    db.commit()

    return {"message": "Access denied"}

@router.get("/{exam_id}/reviews")
def get_mock_exam_reviews(
    exam_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_writer_or_admin(current_user)

    reviews = db.query(MockExamReview).filter_by(mock_exam_id=exam_id).all()
    avg_rating = db.query(func.avg(MockExamReview.rating)).filter_by(mock_exam_id=exam_id).scalar()

    return {
        "average_rating": avg_rating or 0,
        "reviews": reviews
    }

@router.get("/{exam_id}/demo")
def demo_mock_exam_view(
    exam_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_writer_or_admin(current_user)

    exam = db.query(MockExam).filter_by(id=exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Mock exam not found")

    # Assuming questions are linked
    questions = exam.questions  

    return {
        "exam_id": exam.id,
        "title": exam.title,
        "questions": questions
    }
