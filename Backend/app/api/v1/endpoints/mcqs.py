from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models.user import User
from app.models.mcq import MCQ
from app.models.mcq_option import MCQOption
from app.models.mcq_approval import MCQApproval
from app.models.lesson import Lesson
from app.models.subject import Subject
from app.models.university import University
from app.models.question_type import QuestionType
from app.schemas.mcq import MCQCreate, MCQUpdate, MCQResponse, MCQApprovalCreate, MCQApprovalResponse
from app.api.v1.endpoints.auth import get_current_user
#only mcq writer = rank 2 and rank 3 
#users who can approve MCQs = rank 4
#user who can create MCQ packs = rank 5 
#administrator = rank 6 
router = APIRouter()
# --- Dependencies ---
def require_mcq_access(user: User = Depends(get_current_user)):
    if user.rank < 2:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return user

def require_editor(user: User = Depends(get_current_user)):
    if user.rank < 4:
        raise HTTPException(status_code=403, detail="Editor access required")
    return user

def require_pack_creator(user: User = Depends(get_current_user)):
    if user.rank < 5:
        raise HTTPException(status_code=403, detail="Higher privilege required")
    return user

# --- MCQ CRUD ---
@router.post("/", response_model=MCQResponse, status_code=status.HTTP_201_CREATED)
def create_mcq(mcq_data: MCQCreate, db: Session = Depends(get_db), current_user: User = Depends(require_mcq_access)):
    university = db.query(University).filter_by(id=mcq_data.university_id).first()
    subject = db.query(Subject).filter_by(id=mcq_data.subject_id).first()
    lesson = db.query(Lesson).filter_by(id=mcq_data.lesson_id).first()
    qtype = db.query(QuestionType).filter_by(id=mcq_data.question_type_id).first()
    if not all([university, subject, lesson, qtype]):
        raise HTTPException(status_code=400, detail="Invalid university/subject/lesson/type")

    creator_name = f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or current_user.email

    status_value = mcq_data.status
    if current_user.rank in [2, 3] and mcq_data.status != "draft":
        status_value = "pending"

    mcq = MCQ(
        university_id=mcq_data.university_id,
        subject_id=mcq_data.subject_id,
        lesson_id=mcq_data.lesson_id,
        question_type_id=mcq_data.question_type_id,
        title=mcq_data.title,
        question_text=mcq_data.question_text,
        status=status_value,
        created_by=current_user.id,
        creator_name=creator_name
    )

    db.add(mcq)
    db.flush()  # so mcq.id exists

    for opt in mcq_data.options:
        option = MCQOption(
            mcq_id=mcq.id,
            option_text=opt.option_text,
            is_correct=opt.is_correct,
            explanation=opt.explanation
        )
        db.add(option)

    db.commit()
    db.refresh(mcq)
    return mcq

@router.get("/", response_model=List[MCQResponse])
def list_mcqs(
    university_id: Optional[str] = None,
    subject_id: Optional[str] = None,
    lesson_id: Optional[str] = None,
    question_type_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_mcq_access)
):
    query = db.query(MCQ)
    if university_id:
        query = query.filter(MCQ.university_id == university_id)
    if subject_id:
        query = query.filter(MCQ.subject_id == subject_id)
    if lesson_id:
        query = query.filter(MCQ.lesson_id == lesson_id)
    if question_type_id:
        query = query.filter(MCQ.question_type_id == question_type_id)

    return query.order_by(MCQ.created_at.desc()).all()

@router.put("/{mcq_id}", response_model=MCQResponse)
def update_mcq(mcq_id: str, mcq_data: MCQUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_editor)):
    mcq = db.query(MCQ).filter_by(id=mcq_id).first()
    if not mcq:
        raise HTTPException(status_code=404, detail="MCQ not found")

    if mcq_data.title:
        mcq.title = mcq_data.title
    if mcq_data.question_text:
        mcq.question_text = mcq_data.question_text
    if mcq_data.question_type_id:
        mcq.question_type_id = mcq_data.question_type_id
    if mcq_data.status:
        mcq.status = mcq_data.status

    if mcq_data.options is not None:
        db.query(MCQOption).filter_by(mcq_id=mcq.id).delete()
        for opt in mcq_data.options:
            db.add(MCQOption(
                mcq_id=mcq.id,
                option_text=opt.option_text,
                is_correct=opt.is_correct,
                explanation=opt.explanation
            ))

    db.commit()
    db.refresh(mcq)
    return mcq

@router.delete("/{mcq_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mcq(mcq_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_pack_creator)):
    mcq = db.query(MCQ).filter_by(id=mcq_id).first()
    if not mcq:
        raise HTTPException(status_code=404, detail="MCQ not found")
    db.delete(mcq)
    db.commit()
    return None

# --- MCQ Approval ---
@router.post("/{mcq_id}/approve", response_model=MCQApprovalResponse)
def approve_mcq(mcq_id: str, approval: MCQApprovalCreate, db: Session = Depends(get_db), current_user: User = Depends(require_editor)):
    mcq = db.query(MCQ).filter_by(id=mcq_id).first()
    if not mcq:
        raise HTTPException(status_code=404, detail="MCQ not found")
    mcq.status = "approved" if approval.decision == "approved" else "rejected"

    approval_record = MCQApproval(
        mcq_id=mcq.id,
        reviewer_id=current_user.id,
        reviewer_name=f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or current_user.email,
        decision=approval.decision,
        comment=approval.comment
    )
    db.add(approval_record)
    db.commit()
    db.refresh(approval_record)
    return approval_record
