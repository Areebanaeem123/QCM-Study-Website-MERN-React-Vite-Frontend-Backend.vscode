from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, index=True)
    # 🔗 Relationships to University & Subject
    university_id = Column(String, ForeignKey("universities.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(String, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    created_by = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    creator_name = Column(String, nullable=True)

    # ORM Relationships
    university = relationship("University", back_populates="lessons")
    subject = relationship("Subject", back_populates="lessons")
    creator = relationship("User", back_populates="lessons")
