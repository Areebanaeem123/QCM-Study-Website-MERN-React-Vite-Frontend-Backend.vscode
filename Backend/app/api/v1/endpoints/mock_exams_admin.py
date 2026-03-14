from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.core.database import get_db
from app.models.user import User
from app.models.pack import Pack
from app.models.university import University
from app.models.pack_purchase import PackPurchase
from app.models.pack_review import PackReview
from app.schemas.mock_exam import MockExamOut, MockExamStudentOut
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

def require_writer_or_admin(user: User):
    if user.rank not in [5, 6]:
        raise HTTPException(status_code=403, detail="Not authorized")

@router.get("/", response_model=List[MockExamOut])
def list_mock_exams(
    university_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    # Allow students to see list of mock exams

    # Query published mock exams
    exams_query = db.query(Pack).filter(
        Pack.type == "mock_exam",
        Pack.is_published == True
    )

    if university_id:
        exams_query = exams_query.filter(Pack.university_id == university_id)

    exams = exams_query.all()

    results = []
    for exam in exams:
        # Calculate times sold
        times_sold = db.query(func.count(PackPurchase.id)).filter(PackPurchase.pack_id == exam.id).scalar() or 0
        
        # Calculate average rating
        avg_rating = db.query(func.avg(PackReview.rating)).filter(PackReview.pack_id == exam.id).scalar()
        
        results.append({
            "id": exam.id,
            "title": exam.title,
            "description": exam.description,
            "image_url": exam.image_url,
            "university_id": exam.university_id,
            "price": exam.price,
            "currency": exam.currency,
            "created_at": exam.created_at,
            "total_questions": len(exam.mcqs),
            "total_purchases": times_sold,
            "average_rating": avg_rating or 0.0
        })
    return results

@router.get("/{exam_id}/students", response_model=List[MockExamStudentOut])
def get_students_for_mock_exam(
    exam_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_writer_or_admin(current_user)

    students = db.query(User).join(
        PackPurchase,
        PackPurchase.student_id == User.id
    ).filter(
        PackPurchase.pack_id == exam_id
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

    purchase = PackPurchase(
        student_id=user_id,
        pack_id=exam_id,
        gifted=True
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

    purchase = db.query(PackPurchase).filter_by(
        pack_id=exam_id,
        student_id=user_id
    ).first()

    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")

    db.delete(purchase)  # For packs/mocks we usually just delete the access record
    db.commit()

    return {"message": "Access denied"}

@router.get("/{exam_id}/reviews")
def get_mock_exam_reviews(
    exam_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_writer_or_admin(current_user)

    reviews = db.query(PackReview).filter_by(pack_id=exam_id).all()
    avg_rating = db.query(func.avg(PackReview.rating)).filter_by(pack_id=exam_id).scalar()

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

    exam = db.query(Pack).filter_by(id=exam_id, type="mock_exam").first()
    if not exam:
        raise HTTPException(status_code=404, detail="Mock exam not found")

    # Assuming questions are linked via mcqs relationship
    questions = [pm.mcq for pm in exam.mcqs]

    return {
        "exam_id": exam.id,
        "title": exam.title,
        "questions": questions
    }
