from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VoucherCreate(BaseModel):
    code: str
    description: Optional[str] = None
    discount_type: str  # "percentage" or "fixed"
    discount_value: float
    max_uses: Optional[int] = None
    max_uses_per_user: int = 1
    valid_until: datetime
    valid_from: Optional[datetime] = None
    min_purchase_amount: Optional[float] = None
    applicable_to: str = "all"  # "pack", "mock_exam", "all"

class VoucherUpdate(BaseModel):
    description: Optional[str] = None
    is_active: Optional[bool] = None
    max_uses: Optional[int] = None
    valid_until: Optional[datetime] = None

class VoucherResponse(BaseModel):
    id: str
    code: str
    description: Optional[str]
    discount_type: str
    discount_value: float
    max_uses: Optional[int]
    max_uses_per_user: int
    current_uses: int
    valid_from: datetime
    valid_until: datetime
    min_purchase_amount: Optional[float]
    applicable_to: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
