import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class MockExamPurchase(Base):
    __tablename__ = "mock_exam_purchases"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    mock_exam_id = Column(String, ForeignKey("mock_exams.id", ondelete="CASCADE"))
    purchased_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="mock_exam_purchases")
    mock_exam = relationship("MockExam", back_populates="purchases")
