from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models.user import User
from app.models.pack import Pack  # if packs are separate
from app.models.mock_exam import MockExam
from app.schemas.user import UserResponse, UserUpdatePrivilege, GiftPackRequest
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

# --- Access Control ---
def require_admin(user: User = Depends(get_current_user)):
    if user.rank < 6:
        raise HTTPException(status_code=403, detail="Administrator access required")
    return user


# --- List Users ---
@router.get("/", response_model=List[UserResponse])
def list_users(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    query = db.query(User)
    if search:
        query = query.filter(
            (User.first_name.ilike(f"%{search}%")) |
            (User.last_name.ilike(f"%{search}%")) |
            (User.id == search)
        )
    users = query.order_by(User.university_id, User.academic_year, User.first_name).all()
    return users


# --- Get User Details ---
@router.get("/{user_id}", response_model=UserResponse)
def user_details(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# --- Update User Privilege ---
@router.put("/{user_id}/privilege", response_model=UserResponse)
def update_user_privilege(
    user_id: str,
    update_data: UserUpdatePrivilege,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if update_data.rank:
        user.rank = update_data.rank
    
    db.commit()
    db.refresh(user)
    return user


# --- Deny Platform Access ---
@router.put("/{user_id}/deny", response_model=UserResponse)
def deny_platform_access(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


# --- Gift/Deny Pack Access ---
@router.post("/{user_id}/gift_pack")
def gift_or_deny_pack(
    user_id: str,
    request: GiftPackRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Logic to gift or deny pack
    if request.gift:
        # Add pack to user's purchased list (simplified)
        pack = db.query(Pack).filter_by(id=request.pack_id).first()
        if not pack:
            raise HTTPException(status_code=404, detail="Pack not found")
        user.packs.append(pack)
    else:
        # Remove pack
        pack = db.query(Pack).filter_by(id=request.pack_id).first()
        if pack in user.packs:
            user.packs.remove(pack)
    
    db.commit()
    return {"msg": "Action completed successfully"}
