from sqlalchemy import Column, String, DateTime, Boolean, Integer, Float, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class Pack(Base):
    __tablename__ = "packs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Basic Info
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)  # pack image

    # Type: "pack" or "mock_exam"
    type = Column(String, nullable=False)

    # Pricing
    price = Column(Float, nullable=False)
    currency = Column(String, nullable=False)  # CHF, GBP, USD

    # Availability timing
    start_datetime = Column(DateTime(timezone=True), nullable=False)
    expiry_datetime = Column(DateTime(timezone=True), nullable=False)
    display_before_start = Column(Boolean, default=False)

    # Exam settings
    time_limit_minutes = Column(Integer, nullable=True)  # null = unlimited

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
    mcqs = relationship("PackMCQ", back_populates="pack", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="pack", cascade="all, delete-orphan")
    purchases = relationship("PackPurchase", back_populates="pack")
    reviews = relationship("PackReview", back_populates="pack")