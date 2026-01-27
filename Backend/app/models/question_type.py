from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class QuestionType(Base):
    __tablename__ = "question_types"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, index=True, nullable=False)

    # Number of answer choices (4, 5, 10, etc.)
    number_of_options = Column(Integer, nullable=False)

    # "single_correct" OR "true_false_per_option"
    answer_mode = Column(String, nullable=False)

    # Used only when answer_mode = "true_false_per_option"
    # Example: 0.25, 0.5, etc.
    partial_credit = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    created_by = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    creator_name = Column(String, nullable=True)

    # Relationships
    creator = relationship("User", back_populates="question_types")
