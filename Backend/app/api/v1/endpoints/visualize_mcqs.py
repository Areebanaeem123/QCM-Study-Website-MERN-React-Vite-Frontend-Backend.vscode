from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models.user import User
from app.models.mcq import MCQ
from app.schemas.mcq import MCQResponse
from app.schemas.mcq import MCQUpdate
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

# --- Access control: only rank 5 (MCQ pack creator) or rank 6 (admin)
def require_pack_creator_or_admin(user: User = Depends(get_current_user)):
    if user.rank < 5:
        raise HTTPException(status_code=403, detail="Access denied")
    return user

# --- List approved MCQs with optional filters & search
@router.get("/", response_model=List[MCQResponse])
def list_approved_mcqs(
    university_id: Optional[str] = None,
    subject_id: Optional[str] = None,
    lesson_id: Optional[str] = None,
    keyword: Optional[str] = None,   # search field for title/text/ID
    db: Session = Depends(get_db),
    current_user: User = Depends(require_pack_creator_or_admin)
):
    query = db.query(MCQ).filter(MCQ.status == "approved")

    if university_id:
        query = query.filter(MCQ.university_id == university_id)
    if subject_id:
        query = query.filter(MCQ.subject_id == subject_id)
    if lesson_id:
        query = query.filter(MCQ.lesson_id == lesson_id)
    
    if keyword:
        keyword = f"%{keyword}%"
        query = query.filter(
            (MCQ.title.ilike(keyword)) |
            (MCQ.question_text.ilike(keyword)) |
            (MCQ.id.ilike(keyword))
        )

    return query.order_by(MCQ.created_at.desc()).all()

@router.put("/{mcq_id}", response_model=MCQResponse)
def update_mcq(mcq_id: str, mcq_data: MCQUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_pack_creator_or_admin)):
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