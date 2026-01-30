from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
class MCQApproval(Base):
    __tablename__ = "mcq_approvals"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    mcq_id = Column(String, ForeignKey("mcqs.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reviewer_name = Column(String, nullable=True)
    decision = Column(String)  # approved / rejected
    comment = Column(Text, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), server_default=func.now())
    mcq = relationship("MCQ", back_populates="approvals")
