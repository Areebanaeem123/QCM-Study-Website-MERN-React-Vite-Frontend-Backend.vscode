from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class SessionItemCreate(BaseModel):
    pack_id: Optional[str] = None
    mock_exam_id: Optional[str] = None
    # future: question_bank_id: Optional[str] = None


class SessionCreate(BaseModel):
    name: str
    start_date: datetime
    expiry_date: datetime
    session_items: Optional[List[SessionItemCreate]] = []


class SessionItemResponse(BaseModel):
    id: str
    pack_id: Optional[str] = None
    mock_exam_id: Optional[str] = None

    class Config:
        from_attributes = True


class SessionResponse(BaseModel):
    id: str
    name: str
    start_date: datetime
    expiry_date: datetime
    created_by: str
    created_at: datetime
    session_items: List[SessionItemResponse] = []

    class Config:
        from_attributes = True


class SessionUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    session_items: Optional[List[SessionItemCreate]] = None
