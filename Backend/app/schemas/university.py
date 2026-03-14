from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UniversityCreate(BaseModel):
    name: str
    is_displayed: bool = True

class UniversityUpdate(BaseModel):
    name: Optional[str] = None
    is_displayed: Optional[bool] = None

class UniversityResponse(BaseModel):
    id: str
    name: str
    is_displayed: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    creator_name: Optional[str] = None

    class Config:
        from_attributes = True

