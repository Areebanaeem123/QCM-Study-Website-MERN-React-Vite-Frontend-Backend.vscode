from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PackStudentOut(BaseModel):
    student_id: str
    student_name: Optional[str]
    purchased_at: datetime
    gifted: bool

    class Config:
        from_attributes = True

class PackReviewOut(BaseModel):
    student_id: str
    student_name: Optional[str]
    rating: int
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class PackOut(BaseModel):
    id: str
    university_id: str
    title: str
    description: Optional[str]
    start_at: Optional[datetime]
    end_at: Optional[datetime]
    price: Optional[float]
    currency: Optional[str]
    created_at: datetime
    created_by: str
    students: List[PackStudentOut] = []
    reviews: List[PackReviewOut] = []

    class Config:
        from_attributes = True
# -------------------------
# MCQs inside a Pack
# -------------------------
class PackMCQAdd(BaseModel):
    mcq_id: str


class PackMCQResponse(BaseModel):
    mcq_id: str

    class Config:
        from_attributes = True


# -------------------------
# Session (Validity Window)
# -------------------------
class SessionCreate(BaseModel):
    start_time: datetime
    end_time: datetime


class SessionResponse(BaseModel):
    id: str
    start_time: datetime
    end_time: datetime

    class Config:
        from_attributes = True


# -------------------------
# Pack Creation
# -------------------------
class PackCreate(BaseModel):
    university_id: str
    type: str  # "pack" or "mock_exam"

    title: str
    description: Optional[str] = None

    price: float
    currency: str  # CHF / GBP / USD

    time_limit_minutes: Optional[int] = None  # None = unlimited
    is_visible_before_start: bool = False

    mcqs: List[PackMCQAdd]
    session: SessionCreate

    status: Optional[str] = "draft"  # draft or published


class PackUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    time_limit_minutes: Optional[int] = None
    status: Optional[str] = None


class PackResponse(BaseModel):
    id: str
    university_id: str
    type: str

    title: str
    description: Optional[str]

    price: float
    currency: str
    time_limit_minutes: Optional[int]
    is_visible_before_start: bool

    status: str
    created_at: datetime
    creator_name: Optional[str]

    mcqs: List[PackMCQResponse]
    sessions: List[SessionResponse]

    class Config:
        from_attributes = True
