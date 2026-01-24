from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.auth import UserResponse

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
    updated_at: Optional[datetime]
    created_by: str
    creator_name: Optional[str]
    creator: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

