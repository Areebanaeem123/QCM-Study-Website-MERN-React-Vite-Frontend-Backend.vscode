from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.auth import UserResponse
from uuid import UUID
class SubjectCreate(BaseModel):
    name: str
    university_id: str
class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    university_id: Optional[str] = None
class SubjectResponse(BaseModel):
    id: str
    name: str
    university_id: str
    created_at: datetime
    creator_name: str
    class Config:
        from_attributes = True
