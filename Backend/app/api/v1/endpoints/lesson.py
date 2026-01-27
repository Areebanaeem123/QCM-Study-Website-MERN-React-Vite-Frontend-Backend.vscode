from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.models.user import User
from app.models.lesson import Lesson
from app.models.subject import Subject
from app.models.university import University
from app.schemas.lesson import LessonCreate, LessonUpdate, LessonResponse
from app.api.v1.endpoints.auth import require_admin
router = APIRouter()
# 📌 List lessons (optionally filter by university & subject)
@router.get("/", response_model=List[LessonResponse])
async def list_lessons(
    university_id: UUID | None = Query(None),
    subject_id: UUID | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List lessons (admin only). Can filter by university and/or subject."""
    
    query = db.query(Lesson)

    if university_id:
        query = query.filter(Lesson.university_id == university_id)
    if subject_id:
        query = query.filter(Lesson.subject_id == subject_id)

    lessons = query.order_by(Lesson.created_at.desc()).all()
    return lessons


# 📌 Create lesson
@router.post("/", response_model=LessonResponse, status_code=status.HTTP_201_CREATED)
async def create_lesson(
    lesson_data: LessonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a lesson linked to a university and subject (admin only)."""

    # ✅ Validate university exists
    university = db.query(University).filter(University.id == lesson_data.university_id).first()
    if not university:
        raise HTTPException(status_code=404, detail="University not found")

    # ✅ Validate subject exists AND belongs to that university
    subject = db.query(Subject).filter(
        Subject.id == lesson_data.subject_id,
        Subject.university_id == lesson_data.university_id
    ).first()
    if not subject:
        raise HTTPException(status_code=400, detail="Subject does not belong to selected university")

    # ✅ Prevent duplicate lesson names under same subject
    existing_lesson = db.query(Lesson).filter(
        Lesson.name == lesson_data.name,
        Lesson.subject_id == lesson_data.subject_id
    ).first()
    if existing_lesson:
        raise HTTPException(status_code=400, detail="Lesson with this name already exists in this subject")

    # 👤 Creator display name
    creator_name = (
        f"{current_user.first_name} {current_user.last_name}".strip()
        if current_user.first_name or current_user.last_name
        else current_user.email
    )

    new_lesson = Lesson(
        name=lesson_data.name,
        university_id=lesson_data.university_id,
        subject_id=lesson_data.subject_id,
        created_by=current_user.id,
        creator_name=creator_name
    )

    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)

    return new_lesson


# 📌 Get single lesson
@router.get("/{lesson_id}", response_model=LessonResponse)
async def get_lesson(
    lesson_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get a single lesson (admin only)."""
    
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    return lesson


# 📌 Update lesson
@router.put("/{lesson_id}", response_model=LessonResponse)
async def update_lesson(
    lesson_id: UUID,
    lesson_data: LessonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update lesson details (admin only)."""
    
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if lesson_data.name and lesson_data.name != lesson.name:
        duplicate = db.query(Lesson).filter(
            Lesson.name == lesson_data.name,
            Lesson.subject_id == lesson.subject_id
        ).first()
        if duplicate:
            raise HTTPException(status_code=400, detail="Lesson with this name already exists in this subject")
        lesson.name = lesson_data.name

    db.commit()
    db.refresh(lesson)

    return lesson


# 📌 Delete lesson
@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lesson(
    lesson_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Delete a lesson (admin only).
    ⚠️ All records linked via foreign keys should be cascade deleted at DB level.
    """
    
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    db.delete(lesson)
    db.commit()

    return None
