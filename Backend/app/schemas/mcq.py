from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# Used when creating/updating an option
class MCQOptionCreate(BaseModel):
    option_text: str
    is_correct: bool = False
    explanation: Optional[str] = None


class MCQOptionResponse(BaseModel):
    id: str
    option_text: str
    is_correct: bool
    explanation: Optional[str]

    class Config:
        from_attributes = True


class MCQCreate(BaseModel):
    university_id: str
    subject_id: str
    lesson_id: str
    question_type_id: str

    title: str
    question_text: str

    options: List[MCQOptionCreate]

    # "draft" OR "pending"
    status: Optional[str] = "draft"


class MCQUpdate(BaseModel):
    title: Optional[str] = None
    question_text: Optional[str] = None
    question_type_id: Optional[str] = None
    status: Optional[str] = None  # allow sending for approval later

    options: Optional[List[MCQOptionCreate]] = None

class MCQResponse(BaseModel):
    id: str
    university_id: str
    subject_id: str
    lesson_id: str
    question_type_id: str

    title: str
    question_text: str
    status: str

    created_at: datetime
    updated_at: Optional[datetime]

    created_by: str
    creator_name: Optional[str]

    options: List[MCQOptionResponse]

    class Config:
        from_attributes = True

class MCQApprovalCreate(BaseModel):
    decision: str  # "approved" or "rejected"
    comment: Optional[str] = None

class MCQApprovalResponse(BaseModel):
    id: str
    reviewer_id: str
    reviewer_name: Optional[str]
    decision: str
    comment: Optional[str]
    reviewed_at: datetime

    class Config:
        from_attributes = True