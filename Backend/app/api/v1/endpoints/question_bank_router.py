from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.models.mcq import MCQ
from app.models.question_bank import QuestionBank
from app.models.question_bank_purchase import QuestionBankPurchase
from app.models.session import Session as AccessSession
from app.schemas.question_bank import (
    QuestionBankCreate,
    QuestionBankOut,
    QuestionBankStudentOut,
)
from app.api.v1.endpoints.auth import get_current_user
from app.api.v1.endpoints.auth import require_admin

router = APIRouter()
#helper function 
def require_writer_or_admin(current_user: User = Depends(get_current_user)):
    if user.rank not in [5, 6]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user
# ---------------------------------------------------------
# ✅ CREATE QUESTION BANK (Rank 5 & 6)
# ---------------------------------------------------------
@router.post("/", response_model=QuestionBankOut)
def create_question_bank(
    data: QuestionBankCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_writer_or_admin),
):
    qb = QuestionBank(
        university_id=data.university_id,
        title=data.title,
        description=data.description,
    )

    mcqs = db.query(MCQ).filter(MCQ.id.in_(data.mcq_ids)).all()
    qb.mcqs = mcqs

    db.add(qb)
    db.commit()
    db.refresh(qb)

    return QuestionBankOut(
        id=qb.id,
        title=qb.title,
        description=qb.description,
        university_id=qb.university_id,
        total_mcqs=len(qb.mcqs),
        created_at=qb.created_at,
    )


# ---------------------------------------------------------
# 📋 LIST QUESTION BANKS BY UNIVERSITY (Rank 5 & 6)
# ---------------------------------------------------------
@router.get("/university/{university_id}", response_model=List[QuestionBankOut])
def list_question_banks(
    university_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_writer_or_admin),
):
    qbs = db.query(QuestionBank).filter_by(university_id=university_id).all()

    return [
        QuestionBankOut(
            id=qb.id,
            title=qb.title,
            description=qb.description,
            university_id=qb.university_id,
            total_mcqs=len(qb.mcqs),
            created_at=qb.created_at,
        )
        for qb in qbs
    ]


# ---------------------------------------------------------
# ✏️ UPDATE QUESTION BANK (Rank 5 & 6)
# ---------------------------------------------------------
@router.put("/{qb_id}", response_model=QuestionBankOut)
def update_question_bank(
    qb_id: str,
    data: QuestionBankCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_writer_or_admin),
):
    qb = db.query(QuestionBank).get(qb_id)
    if not qb:
        raise HTTPException(status_code=404, detail="Question Bank not found")

    qb.title = data.title
    qb.description = data.description
    qb.university_id = data.university_id

    mcqs = db.query(MCQ).filter(MCQ.id.in_(data.mcq_ids)).all()
    qb.mcqs = mcqs

    db.commit()
    db.refresh(qb)

    return QuestionBankOut(
        id=qb.id,
        title=qb.title,
        description=qb.description,
        university_id=qb.university_id,
        total_mcqs=len(qb.mcqs),
        created_at=qb.created_at,
    )


# ---------------------------------------------------------
# ❌ DELETE QUESTION BANK (Admin only)
# ---------------------------------------------------------
@router.delete("/{qb_id}")
def delete_question_bank(
    qb_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    qb = db.query(QuestionBank).get(qb_id)
    if not qb:
        raise HTTPException(status_code=404, detail="Question Bank not found")

    db.delete(qb)
    db.commit()
    return {"message": "Question Bank deleted"}


# ---------------------------------------------------------
# 💰 PURCHASE QUESTION BANK (Student)
# ---------------------------------------------------------
@router.post("/{qb_id}/purchase")
def purchase_question_bank(
    qb_id: str,
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    qb = db.query(QuestionBank).get(qb_id)
    if not qb:
        raise HTTPException(status_code=404, detail="Question Bank not found")

    session = db.query(AccessSession).get(session_id)
    if not session or session.expiry_date < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired session")

    purchase = QuestionBankPurchase(
        user_id=current_user.id,
        question_bank_id=qb_id,
        session_id=session_id,
    )

    db.add(purchase)
    db.commit()

    return {"message": "Question Bank purchased successfully"}


# ---------------------------------------------------------
# 🎓 STUDENT ACCESS QUESTION BANK CONTENT
# ---------------------------------------------------------
@router.get("/{qb_id}/access", response_model=QuestionBankStudentOut)
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

    if purchase.session and purchase.session.expiry_date < datetime.utcnow():
        raise HTTPException(status_code=403, detail="Session expired")

    qb = db.query(QuestionBank).get(qb_id)

    return QuestionBankStudentOut(
        id=qb.id,
        title=qb.title,
        description=qb.description,
        mcqs=[mcq.id for mcq in qb.mcqs],
    )
