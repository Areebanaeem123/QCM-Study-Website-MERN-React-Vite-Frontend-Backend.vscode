from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.pack import Pack  # existing model
from app.models.mock_exam import MockExam  # if separate
from app.models.session import Session as DBSess, SessionItem
from app.schemas.session import SessionCreate, SessionUpdate, SessionResponse
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


# --- Access Control ---
def require_session_creator(user: User = Depends(get_current_user)):
    if user.rank < 5:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return user


# --- Create Session ---
@router.post("/", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    session_data: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_session_creator)
):
    db_session = DBSess(
        name=session_data.name,
        start_date=session_data.start_date,
        expiry_date=session_data.expiry_date,
        created_by=current_user.id
    )
    db.add(db_session)
    db.flush()  # so db_session.id exists

    for item in session_data.session_items:
        session_item = SessionItem(
            session_id=db_session.id,
            pack_id=item.pack_id,
            mock_exam_id=item.mock_exam_id
        )
        db.add(session_item)

    db.commit()
    db.refresh(db_session)
    return db_session


# --- List Sessions ---
@router.get("/", response_model=List[SessionResponse])
def list_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_session_creator)
):
    return db.query(DBSess).order_by(DBSess.created_at.desc()).all()


# --- Update Session ---
@router.put("/{session_id}", response_model=SessionResponse)
def update_session(
    session_id: str,
    session_data: SessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_session_creator)
):
    db_session = db.query(DBSess).filter_by(id=session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session_data.name:
        db_session.name = session_data.name
    if session_data.start_date:
        db_session.start_date = session_data.start_date
    if session_data.expiry_date:
        db_session.expiry_date = session_data.expiry_date

    if session_data.session_items is not None:
        db.query(SessionItem).filter_by(session_id=db_session.id).delete()
        for item in session_data.session_items:
            db.add(SessionItem(
                session_id=db_session.id,
                pack_id=item.pack_id,
                mock_exam_id=item.mock_exam_id
            ))

    db.commit()
    db.refresh(db_session)
    return db_session


# --- Delete Session ---
@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_session_creator)
):
    db_session = db.query(DBSess).filter_by(id=session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.delete(db_session)
    db.commit()
