from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class QuestionBankCreate(BaseModel):
    university_id: str
    title: str
    description: Optional[str] = None
    mcq_ids: List[str]


class QuestionBankOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    university_id: str
    total_mcqs: int
    created_at: datetime

    class Config:
        from_attributes = True


class QuestionBankStudentOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    mcqs: List[str]  # Or MCQ preview schema later

    class Config:
        from_attributes = True
