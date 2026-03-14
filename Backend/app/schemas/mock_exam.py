from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class MockExamBase(BaseModel):
    title: str
    description: Optional[str] = None
class MockExamMCQPreview(BaseModel):
    id: str
    question_text: str

    class Config:
        from_attributes = True
class MockExamStudentOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    questions: List[MockExamMCQPreview]

    class Config:
        from_attributes = True
class MockExamOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    image_url: Optional[str]
    university_id: str
    price: Optional[float] = 0.0
    currency: Optional[str] = "CHF"
    created_at: datetime
    total_questions: Optional[int] = 0
    total_purchases: Optional[int] = 0
    average_rating: Optional[float] = 0.0

    class Config:
        from_attributes = True
