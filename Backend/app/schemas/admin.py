from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBasic(BaseModel):
    """Basic user info for list display"""
    id: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    rank: int
    is_blocked: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserListResponse(BaseModel):
    """User list with pagination"""
    total: int
    skip: int
    limit: int
    users: List[UserBasic]

class UserDetailResponse(BaseModel):
    """Detailed user info"""
    id: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    civility: Optional[str]
    date_of_birth: Optional[str]
    address: Optional[str]
    country: Optional[str]
    phone_number: Optional[str]
    diploma: Optional[str]
    university: Optional[str]
    rank: int
    is_blocked: bool
    created_at: datetime
    packs_purchased: int
    email_verified: Optional[datetime]

    class Config:
        from_attributes = True

class ChangeRoleRequest(BaseModel):
    """Change user role request"""
    rank: int  # 1 = student, 2 = writer, 3 = content manager, 6 = admin

class BlockUserRequest(BaseModel):
    """Block/unblock user request"""
    is_blocked: bool

class GrantPackRequest(BaseModel):
    """Grant pack access to user"""
    pack_id: str
