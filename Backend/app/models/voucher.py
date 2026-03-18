from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from app.core.database import Base
import uuid

class Voucher(Base):
    __tablename__ = "vouchers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(500), nullable=True)
    
    # Discount information
    discount_type = Column(String(10), nullable=False)  # "percentage" or "fixed"
    discount_value = Column(Float, nullable=False)  # Percentage (e.g., 10 for 10%) or fixed amount
    
    # Usage limits
    max_uses = Column(Integer, nullable=True)  # None = unlimited
    max_uses_per_user = Column(Integer, default=1)
    current_uses = Column(Integer, default=0)
    
    # Validity
    valid_from = Column(DateTime, default=datetime.utcnow)
    valid_until = Column(DateTime, nullable=False)
    
    # Minimum purchase amount
    min_purchase_amount = Column(Float, nullable=True)
    
    # Applicable to specific types
    applicable_to = Column(String(100), nullable=True)  # "pack", "mock_exam", "all"
    
    # Status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String(36), nullable=True)  # Admin ID
    
    # Relationships
    redemptions = relationship("VoucherRedemption", back_populates="voucher", cascade="all, delete-orphan")

    def is_valid(self) -> bool:
        """Check if voucher is valid for use"""
        if not self.is_active:
            return False
        
        now = datetime.utcnow()
        if now < self.valid_from or now > self.valid_until:
            return False
        
        if self.max_uses and self.current_uses >= self.max_uses:
            return False
        
        return True

    def can_be_used_by_user(self, user_id: str, user_usage_count: int) -> bool:
        """Check if user can still use this voucher"""
        return user_usage_count < self.max_uses_per_user

    def calculate_discount(self, original_amount: float) -> float:
        """Calculate discount amount"""
        if self.discount_type == "percentage":
            return (original_amount * self.discount_value) / 100
        else:  # fixed
            return min(self.discount_value, original_amount)


class VoucherRedemption(Base):
    __tablename__ = "voucher_redemptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    voucher_id = Column(String(36), ForeignKey("vouchers.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    transaction_id = Column(String(36), ForeignKey("transactions.id"), nullable=True)
    
    discount_amount = Column(Float, nullable=False)
    redeemed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    voucher = relationship("Voucher", back_populates="redemptions")
