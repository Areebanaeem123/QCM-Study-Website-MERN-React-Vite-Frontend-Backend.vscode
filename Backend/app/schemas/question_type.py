from pydantic import BaseModel, Field, validator
from typing import Optional, Literal
from datetime import datetime
from app.schemas.auth import UserResponse
# -------------------------
# Create
# -------------------------
class QuestionTypeCreate(BaseModel):
    name: str
    number_of_options: int = Field(..., ge=1)
    answer_mode: Literal["single_correct", "true_false_per_option"]
    partial_credit: Optional[float] = Field(None, ge=0, le=1)

    @validator("partial_credit", always=True)
    def validate_partial_credit(cls, v, values):
        mode = values.get("answer_mode")

        if mode == "single_correct" and v is not None:
            raise ValueError("partial_credit must be null when answer_mode is 'single_correct'")

        if mode == "true_false_per_option" and v is None:
            raise ValueError("partial_credit is required when answer_mode is 'true_false_per_option'")

        return v
# -------------------------
# Update
# -------------------------
class QuestionTypeUpdate(BaseModel):
    name: Optional[str] = None
    number_of_options: Optional[int] = Field(None, ge=1)
    answer_mode: Optional[Literal["single_correct", "true_false_per_option"]] = None
    partial_credit: Optional[float] = Field(None, ge=0, le=1)

    @validator("partial_credit", always=True)
    def validate_partial_credit(cls, v, values):
        mode = values.get("answer_mode")

        if mode == "single_correct" and v is not None:
            raise ValueError("partial_credit must be null when answer_mode is 'single_correct'")

        if mode == "true_false_per_option" and v is None:
            raise ValueError("partial_credit is required when answer_mode is 'true_false_per_option'")

        return v
# -------------------------
# Response
# -------------------------
class QuestionTypeResponse(BaseModel):
    id: str
    name: str
    number_of_options: int
    answer_mode: str
    partial_credit: Optional[float]

    created_at: datetime
    updated_at: Optional[datetime]

    created_by: str
    creator_name: Optional[str]

    creator: Optional[UserResponse] = None

    class Config:
        from_attributes = True
