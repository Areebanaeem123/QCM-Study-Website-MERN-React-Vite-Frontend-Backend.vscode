import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from app.models.question_bank_mcq import question_bank_mcqs


class QuestionBank(Base):
    __tablename__ = "question_banks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    university_id = Column(String, ForeignKey("universities.id", ondelete="CASCADE"))

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    mcqs = relationship(
        "MCQ",
        secondary=question_bank_mcqs,
        back_populates="question_banks"
    )

    purchases = relationship("QuestionBankPurchase", back_populates="question_bank", cascade="all, delete")
