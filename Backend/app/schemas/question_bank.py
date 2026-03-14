from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# -------------------------
# Question Bank Review
# -------------------------
class QuestionBankReviewOut(BaseModel):
    student_id: str
    student_name: Optional[str]
    rating: int
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# -------------------------
# Question Bank Student
# -------------------------
class QuestionBankStudentOut(BaseModel):
    student_id: str
    student_name: Optional[str]
    purchased_at: datetime
    gifted: bool

    class Config:
        from_attributes = True


# -------------------------
# MCQ Reference
# -------------------------
class QuestionBankMCQAdd(BaseModel):
    mcq_id: str


class QuestionBankMCQResponse(BaseModel):
    mcq_id: str

    class Config:
        from_attributes = True


# -------------------------
# Question Bank Creation
# -------------------------
class QuestionBankCreate(BaseModel):
    university_id: str
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None

    price: float
    currency: str  # CHF / GBP / USD

    start_datetime: datetime
    expiry_datetime: datetime
    display_before_start: bool = False

    mcq_ids: List[str]

    is_published: Optional[bool] = False


# -------------------------
# Question Bank Update
# -------------------------
class QuestionBankUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    start_datetime: Optional[datetime] = None
    expiry_datetime: Optional[datetime] = None
    display_before_start: Optional[bool] = None
    is_published: Optional[bool] = None


# -------------------------
# Question Bank Output
# -------------------------
class QuestionBankOut(BaseModel):
    id: str
    university_id: str
    title: str
    description: Optional[str]
    image_url: Optional[str]

    price: float
    currency: str

    start_datetime: Optional[datetime] = None
    expiry_datetime: Optional[datetime] = None
    display_before_start: Optional[bool] = False

    is_published: bool
    created_at: datetime
    created_by: str
    creator_name: Optional[str]

    students: List[QuestionBankStudentOut] = []
    reviews: List[QuestionBankReviewOut] = []
    mcqs: List[QuestionBankMCQResponse] = []

    class Config:
        from_attributes = True


# -------------------------
# Question Bank Student Access
# -------------------------
class QuestionBankAccessOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    image_url: Optional[str]
    mcqs: List[str]  # List of MCQ IDs

    class Config:
        from_attributes = True

