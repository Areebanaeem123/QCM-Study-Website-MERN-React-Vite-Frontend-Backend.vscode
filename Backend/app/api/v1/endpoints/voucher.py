"""
Voucher management endpoints
/api/v1/vouchers
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
import json

from app.core.database import get_db
from app.models.user import User
from app.models.voucher import Voucher, VoucherRedemption
from app.schemas.voucher import VoucherCreate, VoucherUpdate, VoucherResponse
from app.schemas.basket import VoucherValidationRequest, VoucherValidationResponse
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


@router.post("/validate", response_model=VoucherValidationResponse)
async def validate_voucher(
    request: VoucherValidationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Validate a voucher code and calculate discount
    """
    voucher = db.query(Voucher).filter_by(code=request.code.upper()).first()
    
    if not voucher:
        return VoucherValidationResponse(
            valid=False,
            message="Voucher code not found"
        )
    
    # Check if voucher is valid
    if not voucher.is_valid():
        return VoucherValidationResponse(
            valid=False,
            message="Voucher code has expired or is no longer active"
        )
    
    # Check minimum purchase amount
    if voucher.min_purchase_amount and request.total_amount < voucher.min_purchase_amount:
        return VoucherValidationResponse(
            valid=False,
            message=f"Minimum purchase amount of {voucher.min_purchase_amount} required"
        )
    
    # Check if user has already used this voucher
    redemptions = db.query(VoucherRedemption).filter_by(
        voucher_id=voucher.id,
        user_id=current_user.id
    ).count()
    
    if not voucher.can_be_used_by_user(current_user.id, redemptions):
        return VoucherValidationResponse(
            valid=False,
            message="You have already used this voucher the maximum number of times"
        )
    
    # Check if applicable to item types
    if voucher.applicable_to != "all":
        applicable_items = [
            item for item in request.items 
            if item.type == voucher.applicable_to
        ]
        if not applicable_items:
            return VoucherValidationResponse(
                valid=False,
                message=f"Voucher is not applicable to these items"
            )
    
    # Calculate discount
    discount = voucher.calculate_discount(request.total_amount)
    final_amount = request.total_amount - discount
    
    discount_percent = None
    if voucher.discount_type == "percentage":
        discount_percent = voucher.discount_value
    
    return VoucherValidationResponse(
        valid=True,
        message="Voucher is valid",
        discount_amount=discount,
        discount_percentage=discount_percent,
        final_amount=final_amount
    )


# Admin endpoints
@router.get("/", response_model=List[VoucherResponse], tags=["admin"])
async def list_vouchers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all vouchers (admin only)"""
    if current_user.rank != 6:  # Admin rank
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view vouchers"
        )
    
    vouchers = db.query(Voucher).all()
    return vouchers


@router.post("/", response_model=VoucherResponse, tags=["admin"])
async def create_voucher(
    voucher_data: VoucherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new voucher (admin only)"""
    if current_user.rank != 6:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create vouchers"
        )
    
    # Check if code already exists
    existing = db.query(Voucher).filter_by(code=voucher_data.code.upper()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Voucher code already exists"
        )
    
    voucher = Voucher(
        code=voucher_data.code.upper(),
        description=voucher_data.description,
        discount_type=voucher_data.discount_type,
        discount_value=voucher_data.discount_value,
        max_uses=voucher_data.max_uses,
        max_uses_per_user=voucher_data.max_uses_per_user,
        valid_from=voucher_data.valid_from or datetime.utcnow(),
        valid_until=voucher_data.valid_until,
        min_purchase_amount=voucher_data.min_purchase_amount,
        applicable_to=voucher_data.applicable_to,
        created_by=current_user.id
    )
    
    db.add(voucher)
    db.commit()
    db.refresh(voucher)
    
    return voucher


@router.put("/{voucher_id}", response_model=VoucherResponse, tags=["admin"])
async def update_voucher(
    voucher_id: str,
    voucher_data: VoucherUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a voucher (admin only)"""
    if current_user.rank != 6:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update vouchers"
        )
    
    voucher = db.query(Voucher).filter_by(id=voucher_id).first()
    if not voucher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voucher not found"
        )
    
    update_data = voucher_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(voucher, field, value)
    
    voucher.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(voucher)
    
    return voucher


@router.delete("/{voucher_id}", tags=["admin"])
async def delete_voucher(
    voucher_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a voucher (admin only)"""
    if current_user.rank != 6:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete vouchers"
        )
    
    voucher = db.query(Voucher).filter_by(id=voucher_id).first()
    if not voucher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voucher not found"
        )
    
    db.delete(voucher)
    db.commit()
    
    return {"message": "Voucher deleted successfully"}
