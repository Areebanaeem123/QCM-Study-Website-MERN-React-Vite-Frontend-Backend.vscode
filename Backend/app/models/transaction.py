from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import uuid

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Stripe-related
    stripe_payment_intent_id = Column(String(255), nullable=True, unique=True)
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_charge_id = Column(String(255), nullable=True)
    
    # Payment details
    status = Column(String(50), default="pending")  # pending, completed, failed, canceled, refunded
    payment_method = Column(String(50), nullable=False)  # "card", "apple_pay", "google_pay"
    payment_method_last_four = Column(String(4), nullable=True)  # Last 4 digits of card
    
    # Amount information
    original_amount = Column(Float, nullable=False)  # Before any discount
    discount_amount = Column(Float, default=0.0)
    final_amount = Column(Float, nullable=False)  # Amount actually charged
    currency = Column(String(3), default="DT")
    
    # Voucher information
    voucher_id = Column(String(36), ForeignKey("vouchers.id"), nullable=True)
    
    # Items purchased
    items_json = Column(Text, nullable=False)  # JSON string of items
    
    # Invoice email
    invoice_sent = Column(Boolean, default=False)
    invoice_sent_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Additional metadata
    customer_email = Column(String(255), nullable=False)
    customer_name = Column(String(255), nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Relationships
    voucher = relationship("Voucher")
