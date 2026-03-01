import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class QuestionBankReview(Base):
    __tablename__ = "question_bank_reviews"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    question_bank_id = Column(String, ForeignKey("question_banks.id", ondelete="CASCADE"))
    student_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    rating = Column(Integer)  # e.g., 1-5 stars
    comment = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    question_bank = relationship("QuestionBank", back_populates="reviews")
    student = relationship("User")
