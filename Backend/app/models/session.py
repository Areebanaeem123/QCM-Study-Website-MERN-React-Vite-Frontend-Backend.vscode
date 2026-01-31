from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)  # e.g., "2025-2026 Academic Year"
    start_date = Column(DateTime, nullable=False)
    expiry_date = Column(DateTime, nullable=False)
    created_by = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    creator = relationship("User")  # optional for easy joins
    session_items = relationship("SessionItem", back_populates="session", cascade="all, delete-orphan")


class SessionItem(Base):
    """
    Link sessions to packs, mock exams, or future question banks
    """
    __tablename__ = "session_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    pack_id = Column(String, ForeignKey("packs.id", ondelete="CASCADE"), nullable=True)
    mock_exam_id = Column(String, ForeignKey("mock_exams.id", ondelete="CASCADE"), nullable=True)
    # optional: question_bank_id in future

    session = relationship("Session", back_populates="session_items")
