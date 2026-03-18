from pydantic import BaseModel
from typing import List, Optional

class BasketItemSchema(BaseModel):
    id: str
    type: str  # "pack" or "mock_exam"
    title: str
    price: float
    currency: str

class BasketCheckoutRequest(BaseModel):
    items: List[BasketItemSchema]
    payment_method: Optional[str] = "simulated"
    accept_terms: bool

class BasketCheckoutResponse(BaseModel):
    message: str
    transaction_id: str
    purchased_items: List[str]
