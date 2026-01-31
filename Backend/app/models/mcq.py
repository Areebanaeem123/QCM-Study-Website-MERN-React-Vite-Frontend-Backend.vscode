from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from sqlalchemy.orm import relationship
from app.models.mock_exam_mcq import mock_exam_mcqs
import uuid
class MCQ(Base):
    __tablename__ = "mcqs"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    # Links
    university_id = Column(String, ForeignKey("universities.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(String, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    lesson_id = Column(String, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    question_type_id = Column(String, ForeignKey("question_types.id", ondelete="CASCADE"), nullable=False)

    title = Column(String, nullable=False)
    question_text = Column(Text, nullable=False)

    # draft / pending / approved / rejected
    status = Column(String, default="draft")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    created_by = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    creator_name = Column(String, nullable=True)

    # Relationships
    options = relationship("MCQOption", back_populates="mcq", cascade="all, delete-orphan")
    approvals = relationship("MCQApproval", back_populates="mcq", cascade="all, delete-orphan")
    mock_exams = relationship("MockExam",secondary=mock_exam_mcqs, back_populates="questions")
    question_banks = relationship(
    "QuestionBank",
    secondary="question_bank_mcqs",
    back_populates="mcqs"
)
