from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class QuizResponseCreate(BaseModel):
    mcq_id: str
    selected_option_id: Optional[str] = None
    is_correct: bool

class QuizResultSubmit(BaseModel):
    pack_id: Optional[str] = None
    question_bank_id: Optional[str] = None
    mock_exam_id: Optional[str] = None
    score: float
    total_questions: int
    correct_answers: int
    mode: str # "practice" or "exam"
    time_taken: int # in seconds
    responses: List[QuizResponseCreate]

class QuizAttemptResponse(BaseModel):
    id: str
    user_id: str
    score: float
    created_at: datetime

    class Config:
        from_attributes = True
