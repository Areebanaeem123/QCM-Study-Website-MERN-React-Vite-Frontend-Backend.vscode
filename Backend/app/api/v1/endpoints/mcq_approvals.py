from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.models.mcq import MCQ
from app.models.mcq_approval import MCQApproval
from app.api.v1.endpoints.auth import get_current_user
from app.schemas.mcq import MCQResponse, MCQApprovalCreate, MCQApprovalResponse
from pydantic import BaseModel

router = APIRouter()


# ============= MODELS =============
class MCQWithApprovalsResponse(MCQResponse):
    """MCQ Response with approval history"""
    approvals: List[MCQApprovalResponse] = []


class PendingMCQsListResponse(BaseModel):
    total: int
    skip: int
    limit: int
    items: List[MCQWithApprovalsResponse]


# ============= HELPER FUNCTION =============
def require_approval_permission(current_user: User):
    """Check if user can approve MCQs (rank 4, 5, or 6)"""
    if current_user.rank not in [4, 5, 6]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to approve MCQs"
        )
    return current_user


# ============= MCQ APPROVAL ENDPOINTS =============

@router.get("/pending-mcqs", response_model=PendingMCQsListResponse)
async def get_pending_mcqs(
    skip: int = 0,
    limit: int = 20,
    universe_id: Optional[str] = None,
    subject_id: Optional[str] = None,
    lesson_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all MCQs pending approval (rank 4,5,6 only).
    - skip: number of items to skip (default 0)
    - limit: number of items to return (default 20, max 100)
    """
    require_approval_permission(current_user)
    
    # Limit max results per page
    limit = min(limit, 100)
    
    query = db.query(MCQ).filter(MCQ.status == "pending")
    
    # Apply filters
    if universe_id:
        query = query.filter(MCQ.university_id == universe_id)
    if subject_id:
        query = query.filter(MCQ.subject_id == subject_id)
    if lesson_id:
        query = query.filter(MCQ.lesson_id == lesson_id)
    
    total = query.count()
    mcqs = query.order_by(MCQ.created_at.desc()).offset(skip).limit(limit).all()
    
    # Populate names from relationships
    for mcq in mcqs:
        if mcq.university:
            mcq.university_name = mcq.university.name
        if mcq.subject:
            mcq.subject_name = mcq.subject.name
        if mcq.lesson:
            mcq.lesson_name = mcq.lesson.name
        if mcq.question_type:
            mcq.question_type_name = mcq.question_type.name
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": mcqs
    }


@router.get("/{mcq_id}", response_model=MCQWithApprovalsResponse)
async def get_mcq_for_approval(
    mcq_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single MCQ with its approval history (rank 4,5,6 only)."""
    require_approval_permission(current_user)
    
    mcq = db.query(MCQ).filter(MCQ.id == mcq_id).first()
    
    if not mcq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MCQ not found"
        )
    
    # Populate names from relationships
    if mcq.university:
        mcq.university_name = mcq.university.name
    if mcq.subject:
        mcq.subject_name = mcq.subject.name
    if mcq.lesson:
        mcq.lesson_name = mcq.lesson.name
    if mcq.question_type:
        mcq.question_type_name = mcq.question_type.name
    
    return mcq


@router.put("/{mcq_id}/approve")
async def approve_mcq(
    mcq_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve an MCQ (rank 4,5,6 only)."""
    require_approval_permission(current_user)
    
    mcq = db.query(MCQ).filter(MCQ.id == mcq_id).first()
    
    if not mcq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MCQ not found"
        )
    
    if mcq.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve MCQ with status '{mcq.status}'"
        )
    
    # Update MCQ status
    mcq.status = "approved"
    mcq.updated_at = datetime.utcnow()
    
    # Record approval
    reviewer_name = (
        f"{current_user.first_name} {current_user.last_name}".strip()
        if current_user.first_name or current_user.last_name
        else current_user.email
    )
    
    approval = MCQApproval(
        mcq_id=mcq_id,
        reviewer_id=current_user.id,
        reviewer_name=reviewer_name,
        decision="approved",
        comment=None
    )
    
    db.add(approval)
    db.commit()
    db.refresh(mcq)
    
    return {
        "message": "MCQ approved successfully",
        "mcq": mcq
    }


@router.put("/{mcq_id}/reject")
async def reject_mcq(
    mcq_id: str,
    rejection_data: MCQApprovalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reject an MCQ with optional comment (rank 4,5,6 only)."""
    require_approval_permission(current_user)
    
    mcq = db.query(MCQ).filter(MCQ.id == mcq_id).first()
    
    if not mcq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MCQ not found"
        )
    
    if mcq.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject MCQ with status '{mcq.status}'"
        )
    
    # Update MCQ status to rejected (or back to draft for revision)
    mcq.status = "draft"  # Go back to draft so creator can revise
    mcq.updated_at = datetime.utcnow()
    
    # Record rejection
    reviewer_name = (
        f"{current_user.first_name} {current_user.last_name}".strip()
        if current_user.first_name or current_user.last_name
        else current_user.email
    )
    
    approval = MCQApproval(
        mcq_id=mcq_id,
        reviewer_id=current_user.id,
        reviewer_name=reviewer_name,
        decision="rejected",
        comment=rejection_data.comment
    )
    
    db.add(approval)
    db.commit()
    db.refresh(mcq)
    
    return {
        "message": "MCQ rejected and reverted to draft for revision",
        "mcq": mcq
    }
