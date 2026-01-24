from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Subject, University, User
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectResponse
from app.api.v1.endpoints.auth import require_admin
router = APIRouter()

@router.post("/", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
async def create_subject(
    subject_data: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    # Check university exists
    university = db.query(University).filter(
        University.id == subject_data.university_id
    ).first()

    if not university:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="University not found"
        )

    creator_name = (
        f"{current_user.first_name} {current_user.last_name}".strip()
        if current_user.first_name or current_user.last_name
        else current_user.email
    )

    subject = Subject(
        name=subject_data.name,
        university_id=subject_data.university_id,
        created_by=current_user.id,
        creator_name=creator_name
    )

    db.add(subject)
    db.commit()
    db.refresh(subject)

    return subject

@router.get("/", response_model=list[SubjectResponse])
async def list_subjects(
    db: Session = Depends(get_db),
    university_id: str | None = None
):
    query = db.query(Subject)

    if university_id:
        query = query.filter(Subject.university_id == university_id)

    return query.all()


@router.get("/{subject_id}", response_model=SubjectResponse)
async def get_subject(
    subject_id: str,
    db: Session = Depends(get_db)
):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()

    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    return subject

@router.put("/{subject_id}", response_model=SubjectResponse)
async def update_subject(
    subject_id: str,
    subject_data: SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()

    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    if subject_data.name is not None:
        subject.name = subject_data.name

    if subject_data.university_id is not None:
        subject.university_id = subject_data.university_id

    db.commit()
    db.refresh(subject)

    return subject

@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(
    subject_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()

    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    db.delete(subject)
    db.commit()

