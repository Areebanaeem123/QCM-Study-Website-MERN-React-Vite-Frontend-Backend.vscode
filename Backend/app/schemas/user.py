from pydantic import BaseModel
from typing import Optional

class UserResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: Optional[str]
    rank: int
    is_active: bool
    university_id: Optional[str]
    academic_year: Optional[int]
    profile_picture: Optional[str]

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    civility: Optional[str] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    phone_number: Optional[str] = None
    university: Optional[str] = None
    academic_year: Optional[str] = None
    profile_picture: Optional[str] = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class UserUpdatePrivilege(BaseModel):
    rank: int

class GiftPackRequest(BaseModel):
    pack_id: str
    gift: bool  # True = give pack, False = remove pack
