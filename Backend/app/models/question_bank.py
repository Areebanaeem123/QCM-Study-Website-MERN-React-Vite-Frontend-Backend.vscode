import uuid
from sqlalchemy import Column, String, Text, DateTime, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from app.models.question_bank_mcq import question_bank_mcqs


class QuestionBank(Base):
    __tablename__ = "question_banks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Basic Info
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)

    # Pricing
    price = Column(Float, nullable=False)
    currency = Column(String, nullable=False)  # CHF, GBP, USD

    # Availability timing
    start_datetime = Column(DateTime(timezone=True), nullable=False)
    expiry_datetime = Column(DateTime(timezone=True), nullable=False)
    display_before_start = Column(Boolean, default=False)

    # Status
    is_published = Column(Boolean, default=False)

    # University link
    university_id = Column(String, ForeignKey("universities.id", ondelete="CASCADE"), nullable=False)

    # Creator tracking
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    creator_name = Column(String, nullable=True)

    # Relationships
    university = relationship("University")
    creator = relationship("User")
    mcqs = relationship(
        "MCQ",
        secondary=question_bank_mcqs,
        back_populates="question_banks"
    )
    purchases = relationship("QuestionBankPurchase", back_populates="question_bank", cascade="all, delete-orphan")
    reviews = relationship("QuestionBankReview", back_populates="question_bank", cascade="all, delete-orphan")
