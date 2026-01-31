from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models import MCQ, Subject, Lesson, University, User
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


# 🔐 Permission check
def require_pack_creator(user: User):
    if user.rank not in [5, 6]:
        raise HTTPException(status_code=403, detail="Not authorized")


# 1️⃣ Get Subjects by University
@router.get("/subjects/{university_id}")
def get_subjects(university_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_pack_creator(user)

    subjects = db.query(Subject).filter(Subject.university_id == university_id).all()
    return subjects


# 2️⃣ Get Lessons by Subject
@router.get("/lessons/{subject_id}")
def get_lessons(subject_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_pack_creator(user)

    lessons = db.query(Lesson).filter(Lesson.subject_id == subject_id).all()
    return lessons


# 3️⃣ Filter MCQs
@router.get("/filter")
def filter_mcqs(
    university_id: int,
    subject_id: Optional[int] = None,
    lesson_id: Optional[int] = None,
    search: Optional[str] = Query(None, description="Search in question text"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    require_pack_creator(user)

    query = db.query(MCQ).join(Subject).join(Lesson)

    query = query.filter(MCQ.university_id == university_id)

    if subject_id:
        query = query.filter(MCQ.subject_id == subject_id)

    if lesson_id:
        query = query.filter(MCQ.lesson_id == lesson_id)

    if search:
        query = query.filter(MCQ.question.ilike(f"%{search}%"))

    mcqs = query.limit(100).all()  # limit for performance
    return mcqs
