from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date

class StudentRegister(BaseModel):
    civility: str
    first_name: str
    last_name: str
    date_of_birth: date

    address: str
    country: str
    phone_number: str

    diploma: str
    former_school: Optional[str] = None
    university: str

    email: EmailStr
    password: str
    confirm_password: str

    accepted_terms: bool = Field(..., description="Must accept terms")
    is_robot_verified: bool


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    rank: int = 1  # Default to student

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    civility: Optional[str] = None
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    country: Optional[str] = None
    phone_number: Optional[str] = None
    university: Optional[str] = None
    academic_year: Optional[str] = None
    profile_picture: Optional[str] = None
    rank: int
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    rank: Optional[int] = None
