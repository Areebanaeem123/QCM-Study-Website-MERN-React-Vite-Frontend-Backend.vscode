# app/models/pack_purchase.py
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
class PackPurchase(Base):
    __tablename__ = "pack_purchases"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pack_id = Column(String, ForeignKey("packs.id", ondelete="CASCADE"))
    student_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    purchased_at = Column(DateTime(timezone=True), server_default=func.now())
    gifted = Column(Boolean, default=False)
    # Relationships
    pack = relationship("Pack", back_populates="purchases")
    student = relationship("User")
