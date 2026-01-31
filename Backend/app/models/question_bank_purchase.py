import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class QuestionBankPurchase(Base):
    __tablename__ = "question_bank_purchases"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    question_bank_id = Column(String, ForeignKey("question_banks.id", ondelete="CASCADE"))
    session_id = Column(String, ForeignKey("sessions.id", ondelete="SET NULL"))

    purchased_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="question_bank_purchases")
    question_bank = relationship("QuestionBank", back_populates="purchases")
