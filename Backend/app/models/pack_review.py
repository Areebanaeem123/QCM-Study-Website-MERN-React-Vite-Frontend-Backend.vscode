# app/models/pack_review.py
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class PackReview(Base):
    __tablename__ = "pack_reviews"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pack_id = Column(String, ForeignKey("packs.id", ondelete="CASCADE"))
    student_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    rating = Column(Integer)  # e.g., 1-5 stars
    comment = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    pack = relationship("Pack", back_populates="reviews")
    student = relationship("User")
