from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # What was this quiz for?
    pack_id = Column(String, ForeignKey("packs.id", ondelete="SET NULL"), nullable=True)
    question_bank_id = Column(String, ForeignKey("question_banks.id", ondelete="SET NULL"), nullable=True)
    mock_exam_id = Column(String, ForeignKey("mock_exams.id", ondelete="SET NULL"), nullable=True)
    
    score = Column(Float, default=0.0)
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Float, default=0.0)
    
    mode = Column(String) # "practice" or "exam"
    time_taken = Column(Integer) # in seconds
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User")
    responses = relationship("QuizResponse", back_populates="attempt", cascade="all, delete-orphan")

class QuizResponse(Base):
    __tablename__ = "quiz_responses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    attempt_id = Column(String, ForeignKey("quiz_attempts.id", ondelete="CASCADE"), nullable=False)
    mcq_id = Column(String, ForeignKey("mcqs.id", ondelete="CASCADE"), nullable=False)
    
    selected_option_id = Column(String, ForeignKey("mcq_options.id", ondelete="CASCADE"), nullable=True)
    selected_option_ids = Column(Text, nullable=True) # JSON list for evaluate mode
    is_correct = Column(Boolean, default=False)
    
    attempt = relationship("QuizAttempt", back_populates="responses")
    mcq = relationship("MCQ")
