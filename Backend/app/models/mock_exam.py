from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from sqlalchemy.orm import relationship
from app.models.mock_exam_mcq import mock_exam_mcqs
import uuid
class MockExam(Base):
    __tablename__ = "mock_exams"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    university_id = Column(String, ForeignKey("universities.id", ondelete="CASCADE"))
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    available_from = Column(DateTime, nullable=True)
    available_until = Column(DateTime, nullable=True)
    time_limit_minutes = Column(Integer, nullable=True)  # None = unlimited

    price = Column(Float, nullable=False)
    currency = Column(String, default="CHF")

    is_published = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String, ForeignKey("users.id"))

    # Relationships
    mcqs = relationship("MCQ", secondary="mock_exam_mcqs", backref="mock_exams")
    questions = relationship("MCQ",secondary=mock_exam_mcqs,back_populates="mock_exams")
    purchases = relationship("MockExamPurchase", back_populates="mock_exam", cascade="all, delete")
    reviews = relationship("MockExamReview", back_populates="mock_exam", cascade="all, delete")