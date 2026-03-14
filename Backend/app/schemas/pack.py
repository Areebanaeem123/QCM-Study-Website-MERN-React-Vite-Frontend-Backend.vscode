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
    start_datetime: datetime
    expiry_datetime: datetime
    display_before_start: bool
    price: float
    currency: str
    is_published: bool
    created_at: datetime
    created_by: str
    creator_name: Optional[str] = None

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
    start_datetime: Optional[datetime] = None
    expiry_datetime: Optional[datetime] = None
    display_before_start: Optional[bool] = False
    time_limit_minutes: Optional[int] = None
    is_published: Optional[bool] = False
    created_at: Optional[datetime] = None
    creator_name: Optional[str] = None

    mcqs: Optional[List[PackMCQResponse]] = []
    sessions: Optional[List[SessionResponse]] = []

    class Config:
        from_attributes = True
