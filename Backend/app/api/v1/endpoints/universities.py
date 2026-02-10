from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.models.university import University
from app.schemas.university import UniversityCreate, UniversityUpdate, UniversityResponse
from app.api.v1.endpoints.auth import require_admin


router = APIRouter()
#router for listing all universities
@router.get("/", response_model=List[UniversityResponse])
async def list_universities(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List all universities (admin only)."""
    universities = db.query(University).order_by(University.created_at.desc()).all()
    return universities


#router for creating universities
@router.post("/", response_model=UniversityResponse, status_code=status.HTTP_201_CREATED)
async def create_university(
    university_data: UniversityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new university (admin only)."""
    # Check if university already exists
    existing_university = db.query(University).filter(
        University.name == university_data.name
    ).first()
    
    if existing_university:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="University with this name already exists"
        )
    # Combine first + last name with email fallback
    creator_name = (
        f"{current_user.first_name} {current_user.last_name}".strip()
        if current_user.first_name or current_user.last_name
        else current_user.email
    )
    # Create new university
    new_university = University(
        name=university_data.name,
        is_displayed=university_data.is_displayed,
        created_by=current_user.id,
        creator_name=creator_name
    )
    
    db.add(new_university)
    db.commit()
    db.refresh(new_university)
    
    return new_university


#router for getting a single university
@router.get("/{university_id}", response_model=UniversityResponse)
async def get_university(
    university_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get a single university (admin only)."""
    university = db.query(University).filter(University.id == university_id).first()
    
    if not university:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="University not found"
        )
    
    return university


#router for updating a university
@router.put("/{university_id}", response_model=UniversityResponse)
async def update_university(
    university_id: str,
    university_data: UniversityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update a university (admin only)."""
    university = db.query(University).filter(University.id == university_id).first()
    
    if not university:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="University not found"
        )
    
    # Check for duplicate name if name is being updated
    if university_data.name and university_data.name != university.name:
        existing_university = db.query(University).filter(
            University.name == university_data.name
        ).first()
        
        if existing_university:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="University with this name already exists"
            )
        university.name = university_data.name
    
    if university_data.is_displayed is not None:
        university.is_displayed = university_data.is_displayed
    
    db.commit()
    db.refresh(university)
    
    return university

#router for deleting a university
@router.delete("/{university_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_university(
    university_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a university (admin only). Cascade delete will handle related records."""
    university = db.query(University).filter(University.id == university_id).first()
    
    if not university:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="University not found"
        )
    
    db.delete(university)
    db.commit()
    
    return None

