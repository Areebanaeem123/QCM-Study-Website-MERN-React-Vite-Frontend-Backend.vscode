from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class BasketItemSchema(BaseModel):
    id: str
    type: str  # "pack" or "mock_exam"
    title: str
    price: float
    currency: str

# Voucher schemas
class VoucherValidationRequest(BaseModel):
    code: str
    total_amount: float
    items: List[BasketItemSchema]

class VoucherValidationResponse(BaseModel):
    valid: bool
    message: str
    discount_amount: Optional[float] = 0.0
    discount_percentage: Optional[float] = None
    final_amount: Optional[float] = 0.0

# Payment schemas
class PaymentMethodSchema(BaseModel):
    type: str  # "card", "apple_pay", "google_pay"
    last_four: Optional[str] = None  # Last 4 digits of card

class StripePaymentRequest(BaseModel):
    payment_intent_id: str
    payment_method_id: Optional[str] = None

class BasketCheckoutRequest(BaseModel):
    items: List[BasketItemSchema]
    payment_method: str  # "card", "apple_pay", "google_pay"
    accept_terms: bool
    voucher_code: Optional[str] = None
    payment_intent_id: Optional[str] = None  # For Stripe
    stripe_token: Optional[str] = None  # For legacy token-based payments

class BasketCheckoutResponse(BaseModel):
    message: str
    transaction_id: str
    purchased_items: List[str]
    status: str  # "pending", "completed", "failed"
    payment_intent_id: Optional[str] = None
    client_secret: Optional[str] = None  # For Stripe SCA

class TransactionResponse(BaseModel):
    id: str
    user_id: str
    status: str
    payment_method: str
    original_amount: float
    discount_amount: float
    final_amount: float
    currency: str
    created_at: datetime
    items_count: int
