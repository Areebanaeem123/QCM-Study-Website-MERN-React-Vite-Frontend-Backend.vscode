from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.schemas.auth import UserResponse


class LessonCreate(BaseModel):
    name: str
    university_id: str
    subject_id: str


class LessonUpdate(BaseModel):
    name: Optional[str] = None


class LessonResponse(BaseModel):
    id: str
    name: str

    university_id: str
    subject_id: str

    created_at: datetime
    updated_at: Optional[datetime]

    created_by: str
    creator_name: Optional[str]

    creator: Optional[UserResponse] = None

    class Config:
        from_attributes = True
