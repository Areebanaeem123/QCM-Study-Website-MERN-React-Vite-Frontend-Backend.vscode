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

    class Config:
        from_attributes = True


class UserUpdatePrivilege(BaseModel):
    rank: int


class GiftPackRequest(BaseModel):
    pack_id: str
    gift: bool  # True = give pack, False = remove pack
