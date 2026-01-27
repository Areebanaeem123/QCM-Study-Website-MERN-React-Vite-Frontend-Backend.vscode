from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.question_type import QuestionType
from app.schemas.question_type import (
    QuestionTypeCreate,
    QuestionTypeUpdate,
    QuestionTypeResponse,
)
from app.api.v1.endpoints.auth import require_admin


router = APIRouter()


# 📌 List all question types
@router.get("/", response_model=List[QuestionTypeResponse])
async def list_question_types(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List all question types (admin only)."""
    question_types = db.query(QuestionType).order_by(QuestionType.created_at.desc()).all()
    return question_types


# 📌 Create question type
@router.post("/", response_model=QuestionTypeResponse, status_code=status.HTTP_201_CREATED)
async def create_question_type(
    question_type_data: QuestionTypeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new question type (admin only)."""

    # Check duplicate name
    existing = db.query(QuestionType).filter(
        QuestionType.name == question_type_data.name
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question type with this name already exists"
        )

    creator_name = (
        f"{current_user.first_name} {current_user.last_name}".strip()
        if current_user.first_name or current_user.last_name
        else current_user.email
    )

    new_question_type = QuestionType(
        name=question_type_data.name,
        number_of_options=question_type_data.number_of_options,
        answer_mode=question_type_data.answer_mode,
        partial_credit=question_type_data.partial_credit,
        created_by=current_user.id,
        creator_name=creator_name
    )

    db.add(new_question_type)
    db.commit()
    db.refresh(new_question_type)

    return new_question_type


# 📌 Get single question type
@router.get("/{question_type_id}", response_model=QuestionTypeResponse)
async def get_question_type(
    question_type_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get a single question type (admin only)."""
    question_type = db.query(QuestionType).filter(QuestionType.id == question_type_id).first()

    if not question_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question type not found"
        )

    return question_type


# 📌 Update question type
@router.put("/{question_type_id}", response_model=QuestionTypeResponse)
async def update_question_type(
    question_type_id: str,
    question_type_data: QuestionTypeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update a question type (admin only)."""

    question_type = db.query(QuestionType).filter(QuestionType.id == question_type_id).first()

    if not question_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question type not found"
        )

    # Check duplicate name if updated
    if question_type_data.name and question_type_data.name != question_type.name:
        existing = db.query(QuestionType).filter(
            QuestionType.name == question_type_data.name
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Question type with this name already exists"
            )
        question_type.name = question_type_data.name

    if question_type_data.number_of_options is not None:
        question_type.number_of_options = question_type_data.number_of_options

    if question_type_data.answer_mode is not None:
        question_type.answer_mode = question_type_data.answer_mode

    if question_type_data.partial_credit is not None:
        question_type.partial_credit = question_type_data.partial_credit

    db.commit()
    db.refresh(question_type)

    return question_type


# 📌 Delete question type
@router.delete("/{question_type_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question_type(
    question_type_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a question type (admin only)."""
    question_type = db.query(QuestionType).filter(QuestionType.id == question_type_id).first()

    if not question_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question type not found"
        )

    db.delete(question_type)
    db.commit()

    return None
