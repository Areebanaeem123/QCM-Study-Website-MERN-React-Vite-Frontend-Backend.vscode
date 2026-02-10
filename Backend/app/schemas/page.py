from pydantic import BaseModel
from datetime import datetime

class PageCreate(BaseModel):
    title: str
    slug: str
    content: str

class PageUpdate(BaseModel):
    title: str | None = None
    content: str | None = None

class PageOut(BaseModel):
    id: int
    title: str
    slug: str
    content: str
    created_at: datetime | None

    class Config:
        from_attributes = True
