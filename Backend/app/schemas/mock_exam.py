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
    university_id: str
    created_at: datetime
    total_questions: int
    total_purchases: int
    average_rating: Optional[float]

    class Config:
        from_attributes = True
