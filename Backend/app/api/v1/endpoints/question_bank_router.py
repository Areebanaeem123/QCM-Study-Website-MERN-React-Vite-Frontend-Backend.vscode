from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.models.mcq import MCQ
from app.models.question_bank import QuestionBank
from app.models.question_bank_purchase import QuestionBankPurchase
from app.models.question_bank_review import QuestionBankReview
from app.models.university import University
from app.schemas.question_bank import (
    QuestionBankCreate,
    QuestionBankUpdate,
    QuestionBankOut,
    QuestionBankStudentOut,
    QuestionBankAccessOut,
    QuestionBankReviewOut,
)
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


# 🔐 Only Rank 5 & 6
def require_question_bank_manager(user: User = Depends(get_current_user)):
    if user.rank < 5:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return user


# ---------------------------------------------------------
# ✅ CREATE QUESTION BANK (Rank 5 & 6)
# ---------------------------------------------------------
@router.post("/", response_model=QuestionBankOut, status_code=status.HTTP_201_CREATED)
def create_question_bank(
    data: QuestionBankCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_question_bank_manager),
):
    university = db.query(University).filter_by(id=data.university_id).first()
    if not university:
        raise HTTPException(status_code=404, detail="University not found")

    creator_name = f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or current_user.email

    qb = QuestionBank(
        university_id=data.university_id,
        title=data.title,
        description=data.description,
        image_url=data.image_url,
        price=data.price,
        currency=data.currency,
        start_datetime=data.start_datetime,
        expiry_datetime=data.expiry_datetime,
        display_before_start=data.display_before_start,
        is_published=data.is_published,
        created_by=current_user.id,
        creator_name=creator_name,
    )

    # Add MCQs
    mcqs = db.query(MCQ).filter(MCQ.id.in_(data.mcq_ids), MCQ.status == "approved").all()
    if len(mcqs) != len(data.mcq_ids):
        raise HTTPException(status_code=400, detail="One or more MCQs not found or not approved")

    qb.mcqs = mcqs
    db.add(qb)
    db.commit()
    db.refresh(qb)

    return QuestionBankOut(
        id=qb.id,
        university_id=qb.university_id,
        title=qb.title,
        description=qb.description,
        image_url=qb.image_url,
        price=qb.price,
        currency=qb.currency,
        start_datetime=qb.start_datetime,
        expiry_datetime=qb.expiry_datetime,
        display_before_start=qb.display_before_start,
        is_published=qb.is_published,
        created_at=qb.created_at,
        created_by=qb.created_by,
        creator_name=qb.creator_name,
        students=[],
        reviews=[],
        mcqs=[],
    )


# ---------------------------------------------------------
# 📋 LIST QUESTION BANKS
# ---------------------------------------------------------
@router.get("/", response_model=List[QuestionBankOut])
def list_question_banks(
    university_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(QuestionBank).filter(QuestionBank.is_published == True)

    if university_id:
        query = query.filter(QuestionBank.university_id == university_id)

    qbs = query.order_by(QuestionBank.created_at.desc()).all()

    results = []
    for qb in qbs:
        students = [
            QuestionBankStudentOut(
                student_id=p.user_id,
                student_name=f"{p.user.first_name or ''} {p.user.last_name or ''}".strip() or p.user.email,
                purchased_at=p.purchased_at,
                gifted=p.gifted,
            )
            for p in qb.purchases
        ]

        reviews = [
            QuestionBankReviewOut(
                student_id=r.student_id,
                student_name=f"{r.student.first_name or ''} {r.student.last_name or ''}".strip() or r.student.email,
                rating=r.rating,
                comment=r.comment,
                created_at=r.created_at,
            )
            for r in qb.reviews
        ]

        results.append(
            QuestionBankOut(
                id=qb.id,
                university_id=qb.university_id,
                title=qb.title,
                description=qb.description,
                image_url=qb.image_url,
                price=qb.price,
                currency=qb.currency,
                start_datetime=qb.start_datetime,
                expiry_datetime=qb.expiry_datetime,
                display_before_start=qb.display_before_start,
                is_published=qb.is_published,
                created_at=qb.created_at,
                created_by=qb.created_by,
                creator_name=qb.creator_name,
                students=students,
                reviews=reviews,
                mcqs=[],
            )
        )

    return results


# ---------------------------------------------------------
# 📖 GET SINGLE QUESTION BANK (Rank 5 & 6)
# ---------------------------------------------------------
@router.get("/{qb_id}", response_model=QuestionBankOut)
def get_question_bank(
    qb_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_question_bank_manager),
):
    qb = db.query(QuestionBank).filter_by(id=qb_id).first()
    if not qb:
        raise HTTPException(status_code=404, detail="Question Bank not found")

    students = [
        QuestionBankStudentOut(
            student_id=p.user_id,
            student_name=f"{p.user.first_name or ''} {p.user.last_name or ''}".strip() or p.user.email,
            purchased_at=p.purchased_at,
            gifted=p.gifted,
        )
        for p in qb.purchases
    ]

    reviews = [
        QuestionBankReviewOut(
            student_id=r.student_id,
            student_name=f"{r.student.first_name or ''} {r.student.last_name or ''}".strip() or r.student.email,
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at,
        )
        for r in qb.reviews
    ]

    return QuestionBankOut(
        id=qb.id,
        university_id=qb.university_id,
        title=qb.title,
        description=qb.description,
        image_url=qb.image_url,
        price=qb.price,
        currency=qb.currency,
        start_datetime=qb.start_datetime,
        expiry_datetime=qb.expiry_datetime,
        display_before_start=qb.display_before_start,
        is_published=qb.is_published,
        created_at=qb.created_at,
        created_by=qb.created_by,
        creator_name=qb.creator_name,
        students=students,
        reviews=reviews,
        mcqs=[],
    )


# ---------------------------------------------------------
# ✏️ UPDATE QUESTION BANK (Rank 5 & 6)
# ---------------------------------------------------------
@router.put("/{qb_id}", response_model=QuestionBankOut)
def update_question_bank(
    qb_id: str,
    data: QuestionBankUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_question_bank_manager),
):
    qb = db.query(QuestionBank).filter_by(id=qb_id).first()
    if not qb:
        raise HTTPException(status_code=404, detail="Question Bank not found")

    for field, value in data.dict(exclude_unset=True).items():
        setattr(qb, field, value)

    db.commit()
    db.refresh(qb)

    students = [
        QuestionBankStudentOut(
            student_id=p.user_id,
            student_name=f"{p.user.first_name or ''} {p.user.last_name or ''}".strip() or p.user.email,
            purchased_at=p.purchased_at,
            gifted=p.gifted,
        )
        for p in qb.purchases
    ]

    reviews = [
        QuestionBankReviewOut(
            student_id=r.student_id,
            student_name=f"{r.student.first_name or ''} {r.student.last_name or ''}".strip() or r.student.email,
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at,
        )
        for r in qb.reviews
    ]

    return QuestionBankOut(
        id=qb.id,
        university_id=qb.university_id,
        title=qb.title,
        description=qb.description,
        image_url=qb.image_url,
        price=qb.price,
        currency=qb.currency,
        start_datetime=qb.start_datetime,
        expiry_datetime=qb.expiry_datetime,
        display_before_start=qb.display_before_start,
        is_published=qb.is_published,
        created_at=qb.created_at,
        created_by=qb.created_by,
        creator_name=qb.creator_name,
        students=students,
        reviews=reviews,
        mcqs=[],
    )


# ---------------------------------------------------------
# ❌ DELETE QUESTION BANK (Rank 5 & 6)
# ---------------------------------------------------------
@router.delete("/{qb_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question_bank(
    qb_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_question_bank_manager),
):
    qb = db.query(QuestionBank).filter_by(id=qb_id).first()
    if not qb:
        raise HTTPException(status_code=404, detail="Question Bank not found")

    db.delete(qb)
    db.commit()


# ---------------------------------------------------------
# 💰 PURCHASE QUESTION BANK (Student)
# ---------------------------------------------------------
@router.post("/{qb_id}/purchase", status_code=status.HTTP_201_CREATED)
def purchase_question_bank(
    qb_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    qb = db.query(QuestionBank).filter_by(id=qb_id).first()
    if not qb:
        raise HTTPException(status_code=404, detail="Question Bank not found")

    # Check if already purchased
    existing_purchase = (
        db.query(QuestionBankPurchase)
        .filter_by(user_id=current_user.id, question_bank_id=qb_id)
        .first()
    )
    if existing_purchase:
        raise HTTPException(status_code=400, detail="Question Bank already purchased")

    # Check if question bank is available
    now = datetime.utcnow()
    if now < qb.start_datetime and not qb.display_before_start:
        raise HTTPException(status_code=403, detail="Question Bank not yet available")
    
    if now > qb.expiry_datetime:
        raise HTTPException(status_code=403, detail="Question Bank has expired")

    purchase = QuestionBankPurchase(
        user_id=current_user.id,
        question_bank_id=qb_id,
        gifted=False,
    )

    db.add(purchase)
    db.commit()

    return {"message": "Question Bank purchased successfully"}


# ---------------------------------------------------------
# 🎓 STUDENT ACCESS QUESTION BANK CONTENT
# ---------------------------------------------------------
@router.get("/{qb_id}/access", response_model=QuestionBankAccessOut)
def access_question_bank(
    qb_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    purchase = (
        db.query(QuestionBankPurchase)
        .filter_by(user_id=current_user.id, question_bank_id=qb_id)
        .first()
    )

    if not purchase:
        raise HTTPException(status_code=403, detail="Access not purchased")

    qb = db.query(QuestionBank).filter_by(id=qb_id).first()
    if not qb:
        raise HTTPException(status_code=404, detail="Question Bank not found")

    return QuestionBankAccessOut(
        id=qb.id,
        title=qb.title,
        description=qb.description,
        image_url=qb.image_url,
        mcqs=[mcq.id for mcq in qb.mcqs],
    )


# ---------------------------------------------------------
# ⭐ ADD REVIEW TO QUESTION BANK (Student)
# ---------------------------------------------------------
@router.post("/{qb_id}/review", status_code=status.HTTP_201_CREATED)
def review_question_bank(
    qb_id: str,
    rating: int = Form(...),
    comment: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    qb = db.query(QuestionBank).filter_by(id=qb_id).first()
    if not qb:
        raise HTTPException(status_code=404, detail="Question Bank not found")

    # Check if student purchased
    purchase = (
        db.query(QuestionBankPurchase)
        .filter_by(user_id=current_user.id, question_bank_id=qb_id)
        .first()
    )
    if not purchase:
        raise HTTPException(status_code=403, detail="Must purchase to review")

    # Check if already reviewed
    existing_review = (
        db.query(QuestionBankReview)
        .filter_by(student_id=current_user.id, question_bank_id=qb_id)
        .first()
    )
    if existing_review:
        raise HTTPException(status_code=400, detail="Already reviewed")

    if not 1 <= rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    review = QuestionBankReview(
        question_bank_id=qb_id,
        student_id=current_user.id,
        rating=rating,
        comment=comment,
    )

    db.add(review)
    db.commit()

    return {"message": "Review added successfully"}


# ---------------------------------------------------------
# 📊 GET QUESTION BANK REVIEWS
# ---------------------------------------------------------
@router.get("/{qb_id}/reviews", response_model=List[QuestionBankReviewOut])
def get_reviews(
    qb_id: str,
    db: Session = Depends(get_db),
):
    qb = db.query(QuestionBank).filter_by(id=qb_id).first()
    if not qb:
        raise HTTPException(status_code=404, detail="Question Bank not found")

    reviews = db.query(QuestionBankReview).filter_by(question_bank_id=qb_id).all()

    return [
        QuestionBankReviewOut(
            student_id=r.student_id,
            student_name=f"{r.student.first_name or ''} {r.student.last_name or ''}".strip() or r.student.email,
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at,
        )
        for r in reviews
    ]

