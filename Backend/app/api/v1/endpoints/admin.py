from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.user import User
from app.models.pack import Pack
from app.models.pack_mcq import PackMCQ
from app.models.university import University
from app.models.subject import Subject
from app.models.lesson import Lesson
from app.models.mcq import MCQ
from app.models.mcq_option import MCQOption
from app.models.question_type import QuestionType
from app.models.pack_purchase import PackPurchase
from app.models.question_bank import QuestionBank
from app.models.question_bank_purchase import QuestionBankPurchase
from app.models.question_bank_review import QuestionBankReview
from app.api.v1.endpoints.auth import get_current_user, require_admin
from app.schemas.university import UniversityCreate, UniversityUpdate, UniversityResponse
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectResponse
from app.schemas.lesson import LessonCreate, LessonUpdate, LessonResponse
from app.schemas.question_type import QuestionTypeCreate, QuestionTypeUpdate, QuestionTypeResponse
from app.schemas.mcq import MCQCreate, MCQUpdate, MCQResponse, MCQOptionResponse
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# Request/Response Models
class ChangeRoleRequest(BaseModel):
    role: int

class ChangeStatusRequest(BaseModel):
    is_blocked: bool

class GrantPackRequest(BaseModel):
    pack_id: str

# Admin Pack Management
class AdminPackCreate(BaseModel):
    title: str
    description: Optional[str] = None
    type: str  # "pack" or "mock_exam"
    university_id: str
    price: float
    currency: str  # CHF, GBP, USD
    start_datetime: datetime
    expiry_datetime: datetime
    display_before_start: bool = False
    time_limit_minutes: Optional[int] = None
    is_published: bool = False
    image_url: Optional[str] = None
    mcq_ids: List[str] = []

class AdminPackUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    university_id: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    start_datetime: Optional[datetime] = None
    expiry_datetime: Optional[datetime] = None
    display_before_start: Optional[bool] = None
    time_limit_minutes: Optional[int] = None
    image_url: Optional[str] = None
    is_published: Optional[bool] = None
    mcq_ids: Optional[List[str]] = None

class AdminPackResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    type: str
    university_id: str
    university_name: Optional[str] = None
    image_url: Optional[str] = None
    price: float
    currency: str
    start_datetime: datetime
    expiry_datetime: datetime
    display_before_start: bool
    time_limit_minutes: Optional[int]
    is_published: bool
    created_at: datetime
    created_by: str
    creator_name: Optional[str]
    mcqs: List[dict] = []

    class Config:
        from_attributes = True

# Response Models
class PackListItem(BaseModel):
    id: str
    name: str
    price: float
    currency: str

# Admin Question Bank Management
class AdminQuestionBankCreate(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    university_id: str
    price: float
    currency: str  # CHF, GBP, USD
    start_datetime: datetime
    expiry_datetime: datetime
    display_before_start: bool = False
    is_published: bool = False
    mcq_ids: List[str] = []

class AdminQuestionBankUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    university_id: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    start_datetime: Optional[datetime] = None
    expiry_datetime: Optional[datetime] = None
    display_before_start: Optional[bool] = None
    is_published: Optional[bool] = None
    mcq_ids: Optional[List[str]] = None

class AdminQuestionBankResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    image_url: Optional[str]
    university_id: str
    university_name: Optional[str] = None
    price: float
    currency: str
    start_datetime: datetime
    expiry_datetime: datetime
    display_before_start: bool
    is_published: bool
    created_at: datetime
    created_by: str
    creator_name: Optional[str]
    mcqs: List[dict] = []
    student_count: int = 0
    review_count: int = 0
    average_rating: Optional[float] = None

    class Config:
        from_attributes = True

router = APIRouter()

# ============= USERS MANAGEMENT =============

@router.get("/users")
async def list_users(
    search: str = "",
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of users with optional search.
    Requires admin access.
    """
    require_admin(current_user)
    
    query = db.query(User)
    
    if search:
        query = query.filter(
            (User.email.ilike(f"%{search}%")) |
            (User.first_name.ilike(f"%{search}%")) |
            (User.last_name.ilike(f"%{search}%"))
        )
    
    total = query.count()
    users = query.offset(skip).limit(limit).all()
    
    # Get pack counts for each user
    result = []
    for user in users:
        pack_count = db.query(PackPurchase).filter(PackPurchase.student_id == user.id).count()
        
        result.append({
            "id": user.id,
            "name": f"{user.first_name} {user.last_name}",
            "email": user.email,
            "role": user.rank,
            "role_name": get_role_name(user.rank),
            "packs": pack_count,
            "is_blocked": user.is_blocked if hasattr(user, 'is_blocked') else False,
            "created_at": user.created_at.isoformat() if user.created_at else None
        })
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": result
    }


@router.get("/users/{user_id}")
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user details."""
    require_admin(current_user)
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    pack_count = db.query(PackPurchase).filter(PackPurchase.student_id == user.id).count()
    
    return {
        "id": user.id,
        "name": f"{user.first_name} {user.last_name}",
        "email": user.email,
        "role": user.rank,
        "role_name": get_role_name(user.rank),
        "packs": pack_count,
        "is_blocked": user.is_blocked if hasattr(user, 'is_blocked') else False,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "civility": user.civility,
        "date_of_birth": user.date_of_birth.isoformat() if user.date_of_birth else None,
        "country": user.country,
        "phone_number": user.phone_number
    }


@router.put("/users/{user_id}/role")
async def change_user_role(
    user_id: str,
    request: ChangeRoleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change user role/rank.
    Valid roles: 1=Student, 2=Writer, 3=Content Manager, 6=Admin
    """
    require_admin(current_user)
    
    if request.role not in [1, 2, 3, 6]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.rank = request.role
    db.commit()
    db.refresh(user)
    
    return {
        "id": user.id,
        "role": user.rank,
        "role_name": get_role_name(user.rank),
        "message": f"User role updated to {get_role_name(user.rank)}"
    }


@router.post("/users/{user_id}/grant-pack/{pack_id}")
async def grant_pack_to_user(
    user_id: str,
    pack_id: str,
    request: GrantPackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Grant pack access to user (admin gift)."""
    require_admin(current_user)
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    pack = db.query(Pack).filter(Pack.id == request.pack_id).first()
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    # Check if user already has access
    existing = db.query(PackPurchase).filter(
        PackPurchase.student_id == user_id,
        PackPurchase.pack_id == request.pack_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User already has access to this pack")
    
    # Create purchase record for admin gift
    purchase = PackPurchase(
        student_id=user_id,
        pack_id=request.pack_id,
        gifted=True
    )
    
    db.add(purchase)
    db.commit()
    db.refresh(purchase)
    
    return {
        "id": purchase.id,
        "user_id": user_id,
        "pack_id": pack_id,
        "message": f"Pack '{pack.name}' granted to user"
    }


@router.put("/users/{user_id}/status")
async def change_user_status(
    user_id: str,
    request: ChangeStatusRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Block or unblock a user."""
    require_admin(current_user)
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not hasattr(user, 'is_blocked'):
        # Add is_blocked attribute if it doesn't exist (migration scenario)
        user.is_blocked = request.is_blocked
    else:
        user.is_blocked = request.is_blocked
    
    db.commit()
    db.refresh(user)
    
    status_text = "blocked" if request.is_blocked else "unblocked"
    return {
        "id": user.id,
        "is_blocked": request.is_blocked,
        "message": f"User {status_text}"
    }



# ============= PACKS MANAGEMENT =============

@router.get("/packs")
async def list_packs_admin(
    pack_type: Optional[str] = None,
    university_id: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all packs with optional filters (admin only)."""
    require_admin(current_user)
    
    query = db.query(Pack)
    
    if pack_type:
        query = query.filter(Pack.type == pack_type)
    
    if university_id:
        query = query.filter(Pack.university_id == university_id)
    
    if search:
        query = query.filter(Pack.title.ilike(f"%{search}%"))
    
    total = query.count()
    packs = query.order_by(Pack.created_at.desc()).offset(skip).limit(limit).all()
    
    # Format pack data with MCQs
    items = []
    for pack in packs:
        mcq_data = [
            {
                "id": pack_mcq.mcq.id,
                "title": pack_mcq.mcq.title,
                "question_text": pack_mcq.mcq.question_text
            }
            for pack_mcq in pack.mcqs
        ]
        
        items.append({
            "id": pack.id,
            "title": pack.title,
            "description": pack.description,
            "type": pack.type,
            "university_id": pack.university_id,
            "university_name": pack.university.name if pack.university else None,
            "image_url": pack.image_url,
            "price": pack.price,
            "currency": pack.currency,
            "start_datetime": pack.start_datetime.isoformat() if pack.start_datetime else None,
            "expiry_datetime": pack.expiry_datetime.isoformat() if pack.expiry_datetime else None,
            "display_before_start": pack.display_before_start,
            "time_limit_minutes": pack.time_limit_minutes,
            "is_published": pack.is_published,
            "created_at": pack.created_at.isoformat() if pack.created_at else None,
            "created_by": pack.created_by,
            "creator_name": pack.creator_name,
            "mcqs": mcq_data
        })
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": items
    }


@router.post("/packs", response_model=AdminPackResponse, status_code=status.HTTP_201_CREATED)
async def create_pack_admin(
    pack_data: AdminPackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new pack (admin only)."""
    try:
        require_admin(current_user)
        
        # Validate university exists
        university = db.query(University).filter_by(id=pack_data.university_id).first()
        if not university:
            raise HTTPException(status_code=404, detail="University not found")
        
        # Create pack
        creator_name = f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or current_user.email
        
        pack = Pack(
            title=pack_data.title,
            description=pack_data.description,
            type=pack_data.type,
            university_id=pack_data.university_id,
            price=pack_data.price,
            currency=pack_data.currency,
            start_datetime=pack_data.start_datetime,
            expiry_datetime=pack_data.expiry_datetime,
            display_before_start=pack_data.display_before_start,
            time_limit_minutes=pack_data.time_limit_minutes,
            is_published=pack_data.is_published,
            image_url=pack_data.image_url,
            created_by=current_user.id,
            creator_name=creator_name
        )
        
        db.add(pack)
        db.flush()
        
        # Add MCQs if provided
        if pack_data.mcq_ids:
            for index, mcq_id in enumerate(pack_data.mcq_ids, start=1):
                mcq = db.query(MCQ).filter_by(id=mcq_id).first()
                if not mcq:
                    db.rollback()
                    raise HTTPException(status_code=404, detail=f"MCQ {mcq_id} not found")
                
                pack_mcq = PackMCQ(pack_id=pack.id, mcq_id=mcq_id, position=index)
                db.add(pack_mcq)
        
        db.commit()
        db.refresh(pack)
        
        # Return formatted response
        mcq_data = [
            {"id": pm.mcq.id, "title": pm.mcq.title, "question_text": pm.mcq.question_text}
            for pm in pack.mcqs
        ]
        
        return AdminPackResponse(
            id=pack.id,
            title=pack.title,
            description=pack.description,
            type=pack.type,
            university_id=pack.university_id,
            university_name=pack.university.name if pack.university else None,
            image_url=pack.image_url,
            price=pack.price,
            currency=pack.currency,
            start_datetime=pack.start_datetime,
            expiry_datetime=pack.expiry_datetime,
            display_before_start=pack.display_before_start,
            time_limit_minutes=pack.time_limit_minutes,
            is_published=pack.is_published,
            created_at=pack.created_at,
            created_by=pack.created_by,
            creator_name=pack.creator_name,
            mcqs=mcq_data
        )
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        db.rollback()
        import traceback
        print(f"Error creating pack: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to create pack: {str(e)}"
        )


@router.get("/packs/{pack_id}", response_model=AdminPackResponse)
async def get_pack_admin(
    pack_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific pack (admin only)."""
    require_admin(current_user)
    
    pack = db.query(Pack).filter_by(id=pack_id).first()
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    mcq_data = [
        {"id": pm.mcq.id, "title": pm.mcq.title, "question_text": pm.mcq.question_text}
        for pm in pack.mcqs
    ]
    
    return AdminPackResponse(
        id=pack.id,
        title=pack.title,
        description=pack.description,
        type=pack.type,
        university_id=pack.university_id,
        university_name=pack.university.name if pack.university else None,
        image_url=pack.image_url,
        price=pack.price,
        currency=pack.currency,
        start_datetime=pack.start_datetime,
        expiry_datetime=pack.expiry_datetime,
        display_before_start=pack.display_before_start,
        time_limit_minutes=pack.time_limit_minutes,
        is_published=pack.is_published,
        created_at=pack.created_at,
        created_by=pack.created_by,
        creator_name=pack.creator_name,
        mcqs=mcq_data
    )


@router.put("/packs/{pack_id}", response_model=AdminPackResponse)
async def update_pack_admin(
    pack_id: str,
    pack_data: AdminPackUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a pack (admin only)."""
    require_admin(current_user)
    
    pack = db.query(Pack).filter_by(id=pack_id).first()
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    # Update fields if provided
    if pack_data.title is not None:
        pack.title = pack_data.title
    if pack_data.description is not None:
        pack.description = pack_data.description
    if pack_data.type is not None:
        pack.type = pack_data.type
    if pack_data.university_id is not None:
        # Validate university exists
        university = db.query(University).filter_by(id=pack_data.university_id).first()
        if not university:
            raise HTTPException(status_code=404, detail="University not found")
        pack.university_id = pack_data.university_id
    if pack_data.price is not None:
        pack.price = pack_data.price
    if pack_data.currency is not None:
        pack.currency = pack_data.currency
    if pack_data.start_datetime is not None:
        pack.start_datetime = pack_data.start_datetime
    if pack_data.expiry_datetime is not None:
        pack.expiry_datetime = pack_data.expiry_datetime
    if pack_data.display_before_start is not None:
        pack.display_before_start = pack_data.display_before_start
    if pack_data.time_limit_minutes is not None:
        pack.time_limit_minutes = pack_data.time_limit_minutes
    if pack_data.image_url is not None:
        pack.image_url = pack_data.image_url
    if pack_data.is_published is not None:
        pack.is_published = pack_data.is_published
    
    # Update MCQs if provided
    if pack_data.mcq_ids is not None:
        # Remove old MCQs
        db.query(PackMCQ).filter_by(pack_id=pack_id).delete()
        
        # Add new MCQs
        for index, mcq_id in enumerate(pack_data.mcq_ids, start=1):
            mcq = db.query(MCQ).filter_by(id=mcq_id).first()
            if not mcq:
                db.rollback()
                raise HTTPException(status_code=404, detail=f"MCQ {mcq_id} not found")
            
            pack_mcq = PackMCQ(pack_id=pack.id, mcq_id=mcq_id, position=index)
            db.add(pack_mcq)
    
    db.commit()
    db.refresh(pack)
    
    # Return formatted response
    mcq_data = [
        {"id": pm.mcq.id, "title": pm.mcq.title, "question_text": pm.mcq.question_text}
        for pm in pack.mcqs
    ]
    
    return AdminPackResponse(
        id=pack.id,
        title=pack.title,
        description=pack.description,
        type=pack.type,
        university_id=pack.university_id,
        university_name=pack.university.name if pack.university else None,
        image_url=pack.image_url,
        price=pack.price,
        currency=pack.currency,
        start_datetime=pack.start_datetime,
        expiry_datetime=pack.expiry_datetime,
        display_before_start=pack.display_before_start,
        time_limit_minutes=pack.time_limit_minutes,
        is_published=pack.is_published,
        created_at=pack.created_at,
        created_by=pack.created_by,
        creator_name=pack.creator_name,
        mcqs=mcq_data
    )


@router.delete("/packs/{pack_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pack_admin(
    pack_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a pack (admin only)."""
    require_admin(current_user)
    
    pack = db.query(Pack).filter_by(id=pack_id).first()
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    # Delete associated MCQs (they'll be cascade deleted)
    db.delete(pack)
    db.commit()


# ============= QUESTION BANK MANAGEMENT =============

@router.get("/question-banks")
async def list_question_banks_admin(
    university_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all question banks (admin only)."""
    require_admin(current_user)
    
    # Limit max results per page
    limit = min(limit, 100)
    
    query = db.query(QuestionBank)
    
    if university_id:
        query = query.filter(QuestionBank.university_id == university_id)
    
    total = query.count()
    qbs = query.order_by(QuestionBank.created_at.desc()).offset(skip).limit(limit).all()
    
    items = []
    for qb in qbs:
        mcq_data = [{"id": mcq.id, "title": mcq.title, "question_text": mcq.question_text} for mcq in qb.mcqs]
        
        # Calculate stats
        student_count = db.query(QuestionBankPurchase).filter_by(question_bank_id=qb.id).count()
        reviews = db.query(QuestionBankReview).filter_by(question_bank_id=qb.id).all()
        review_count = len(reviews)
        average_rating = sum([r.rating for r in reviews]) / review_count if reviews else None
        
        items.append(AdminQuestionBankResponse(
            id=qb.id,
            title=qb.title,
            description=qb.description,
            image_url=qb.image_url,
            university_id=qb.university_id,
            university_name=qb.university.name if qb.university else None,
            price=qb.price,
            currency=qb.currency,
            start_datetime=qb.start_datetime,
            expiry_datetime=qb.expiry_datetime,
            display_before_start=qb.display_before_start,
            is_published=qb.is_published,
            created_at=qb.created_at,
            created_by=qb.created_by,
            creator_name=qb.creator_name,
            mcqs=mcq_data,
            student_count=student_count,
            review_count=review_count,
            average_rating=average_rating
        ))
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": items
    }


@router.post("/question-banks", response_model=AdminQuestionBankResponse, status_code=status.HTTP_201_CREATED)
async def create_question_bank_admin(
    qb_data: AdminQuestionBankCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new question bank (admin only)."""
    try:
        require_admin(current_user)
        
        # Validate university exists
        university = db.query(University).filter_by(id=qb_data.university_id).first()
        if not university:
            raise HTTPException(status_code=404, detail="University not found")
        
        # Create question bank
        creator_name = f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or current_user.email
        
        qb = QuestionBank(
            title=qb_data.title,
            description=qb_data.description,
            image_url=qb_data.image_url,
            university_id=qb_data.university_id,
            price=qb_data.price,
            currency=qb_data.currency,
            start_datetime=qb_data.start_datetime,
            expiry_datetime=qb_data.expiry_datetime,
            display_before_start=qb_data.display_before_start,
            is_published=qb_data.is_published,
            created_by=current_user.id,
            creator_name=creator_name
        )
        
        db.add(qb)
        db.flush()
        
        # Add MCQs if provided
        if qb_data.mcq_ids:
            for mcq_id in qb_data.mcq_ids:
                mcq = db.query(MCQ).filter_by(id=mcq_id).first()
                if not mcq:
                    db.rollback()
                    raise HTTPException(status_code=404, detail=f"MCQ {mcq_id} not found")
                qb.mcqs.append(mcq)
        
        db.commit()
        db.refresh(qb)
        
        # Return formatted response
        mcq_data = [{"id": mcq.id, "title": mcq.title, "question_text": mcq.question_text} for mcq in qb.mcqs]
        
        return AdminQuestionBankResponse(
            id=qb.id,
            title=qb.title,
            description=qb.description,
            image_url=qb.image_url,
            university_id=qb.university_id,
            university_name=qb.university.name if qb.university else None,
            price=qb.price,
            currency=qb.currency,
            start_datetime=qb.start_datetime,
            expiry_datetime=qb.expiry_datetime,
            display_before_start=qb.display_before_start,
            is_published=qb.is_published,
            created_at=qb.created_at,
            created_by=qb.created_by,
            creator_name=qb.creator_name,
            mcqs=mcq_data,
            student_count=0,
            review_count=0,
            average_rating=None
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        import traceback
        print(f"Error creating question bank: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to create question bank: {str(e)}"
        )


@router.get("/question-banks/{qb_id}", response_model=AdminQuestionBankResponse)
async def get_question_bank_admin(
    qb_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific question bank (admin only)."""
    require_admin(current_user)
    
    qb = db.query(QuestionBank).filter_by(id=qb_id).first()
    if not qb:
        raise HTTPException(status_code=404, detail="Question Bank not found")
    
    mcq_data = [{"id": mcq.id, "title": mcq.title, "question_text": mcq.question_text} for mcq in qb.mcqs]
    
    # Calculate stats
    student_count = db.query(QuestionBankPurchase).filter_by(question_bank_id=qb.id).count()
    reviews = db.query(QuestionBankReview).filter_by(question_bank_id=qb.id).all()
    review_count = len(reviews)
    average_rating = sum([r.rating for r in reviews]) / review_count if reviews else None
    
    return AdminQuestionBankResponse(
        id=qb.id,
        title=qb.title,
        description=qb.description,
        image_url=qb.image_url,
        university_id=qb.university_id,
        university_name=qb.university.name if qb.university else None,
        price=qb.price,
        currency=qb.currency,
        start_datetime=qb.start_datetime,
        expiry_datetime=qb.expiry_datetime,
        display_before_start=qb.display_before_start,
        is_published=qb.is_published,
        created_at=qb.created_at,
        created_by=qb.created_by,
        creator_name=qb.creator_name,
        mcqs=mcq_data,
        student_count=student_count,
        review_count=review_count,
        average_rating=average_rating
    )


@router.put("/question-banks/{qb_id}", response_model=AdminQuestionBankResponse)
async def update_question_bank_admin(
    qb_id: str,
    qb_data: AdminQuestionBankUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a question bank (admin only)."""
    require_admin(current_user)
    
    qb = db.query(QuestionBank).filter_by(id=qb_id).first()
    if not qb:
        raise HTTPException(status_code=404, detail="Question Bank not found")
    
    # Update fields if provided
    if qb_data.title is not None:
        qb.title = qb_data.title
    if qb_data.description is not None:
        qb.description = qb_data.description
    if qb_data.image_url is not None:
        qb.image_url = qb_data.image_url
    if qb_data.university_id is not None:
        university = db.query(University).filter_by(id=qb_data.university_id).first()
        if not university:
            raise HTTPException(status_code=404, detail="University not found")
        qb.university_id = qb_data.university_id
    if qb_data.price is not None:
        qb.price = qb_data.price
    if qb_data.currency is not None:
        qb.currency = qb_data.currency
    if qb_data.start_datetime is not None:
        qb.start_datetime = qb_data.start_datetime
    if qb_data.expiry_datetime is not None:
        qb.expiry_datetime = qb_data.expiry_datetime
    if qb_data.display_before_start is not None:
        qb.display_before_start = qb_data.display_before_start
    if qb_data.is_published is not None:
        qb.is_published = qb_data.is_published
    
    # Update MCQs if provided
    if qb_data.mcq_ids is not None:
        qb.mcqs.clear()
        for mcq_id in qb_data.mcq_ids:
            mcq = db.query(MCQ).filter_by(id=mcq_id).first()
            if not mcq:
                db.rollback()
                raise HTTPException(status_code=404, detail=f"MCQ {mcq_id} not found")
            qb.mcqs.append(mcq)
    
    db.commit()
    db.refresh(qb)
    
    # Return formatted response
    mcq_data = [{"id": mcq.id, "title": mcq.title, "question_text": mcq.question_text} for mcq in qb.mcqs]
    
    # Calculate stats
    student_count = db.query(QuestionBankPurchase).filter_by(question_bank_id=qb.id).count()
    reviews = db.query(QuestionBankReview).filter_by(question_bank_id=qb.id).all()
    review_count = len(reviews)
    average_rating = sum([r.rating for r in reviews]) / review_count if reviews else None
    
    return AdminQuestionBankResponse(
        id=qb.id,
        title=qb.title,
        description=qb.description,
        image_url=qb.image_url,
        university_id=qb.university_id,
        university_name=qb.university.name if qb.university else None,
        price=qb.price,
        currency=qb.currency,
        start_datetime=qb.start_datetime,
        expiry_datetime=qb.expiry_datetime,
        display_before_start=qb.display_before_start,
        is_published=qb.is_published,
        created_at=qb.created_at,
        created_by=qb.created_by,
        creator_name=qb.creator_name,
        mcqs=mcq_data,
        student_count=student_count,
        review_count=review_count,
        average_rating=average_rating
    )


@router.delete("/question-banks/{qb_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question_bank_admin(
    qb_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a question bank (admin only)."""
    require_admin(current_user)
    
    qb = db.query(QuestionBank).filter_by(id=qb_id).first()
    if not qb:
        raise HTTPException(status_code=404, detail="Question Bank not found")
    
    db.delete(qb)
    db.commit()


# ============= MOCK EXAMS MANAGEMENT =============

@router.get("/mock-exams")
async def list_mock_exams_admin(
    pack_type: str = Query(None),
    university_id: str = Query(None),
    search: str = Query(None),
    skip: int = Query(0),
    limit: int = Query(100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all mock exams with optional filters (admin only)."""
    require_admin(current_user)
    
    query = db.query(Pack).filter(Pack.type == "mock_exam")

    if pack_type:
        query = query.filter(Pack.type == pack_type)

    if university_id:
        query = query.filter(Pack.university_id == university_id)

    if search:
        query = query.filter(Pack.title.ilike(f"%{search}%"))

    total = query.count()
    packs = query.order_by(Pack.created_at.desc()).offset(skip).limit(limit).all()

    # Format response
    response_data = []
    for pack in packs:
        mcq_data = [
            {"id": pm.mcq.id, "title": pm.mcq.title, "question_text": pm.mcq.question_text}
            for pm in pack.mcqs
        ]
        response_data.append({
            "id": pack.id,
            "title": pack.title,
            "description": pack.description,
            "type": pack.type,
            "university_id": pack.university_id,
            "university_name": pack.university.name if pack.university else None,
            "image_url": pack.image_url,
            "price": pack.price,
            "currency": pack.currency,
            "start_datetime": pack.start_datetime,
            "expiry_datetime": pack.expiry_datetime,
            "display_before_start": pack.display_before_start,
            "time_limit_minutes": pack.time_limit_minutes,
            "is_published": pack.is_published,
            "created_at": pack.created_at,
            "created_by": pack.created_by,
            "creator_name": pack.creator_name,
            "mcqs": mcq_data
        })

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": response_data
    }


@router.post("/mock-exams", response_model=AdminPackResponse, status_code=status.HTTP_201_CREATED)
async def create_mock_exam_admin(
    pack_data: AdminPackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new mock exam (admin only)."""
    require_admin(current_user)
    
    # Validate university exists
    university = db.query(University).filter_by(id=pack_data.university_id).first()
    if not university:
        raise HTTPException(status_code=404, detail="University not found")
    
    # Create mock exam with type="mock_exam"
    creator_name = f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or current_user.email
    
    pack = Pack(
        title=pack_data.title,
        description=pack_data.description,
        type="mock_exam",  # Force type to mock_exam
        university_id=pack_data.university_id,
        price=pack_data.price,
        currency=pack_data.currency,
        start_datetime=pack_data.start_datetime,
        expiry_datetime=pack_data.expiry_datetime,
        display_before_start=pack_data.display_before_start,
        time_limit_minutes=pack_data.time_limit_minutes,
        is_published=pack_data.is_published,
        created_by=current_user.id,
        creator_name=creator_name
    )
    
    db.add(pack)
    db.flush()
    
    # Add MCQs if provided
    if pack_data.mcq_ids:
        for index, mcq_id in enumerate(pack_data.mcq_ids, start=1):
            mcq = db.query(MCQ).filter_by(id=mcq_id).first()
            if not mcq:
                db.rollback()
                raise HTTPException(status_code=404, detail=f"MCQ {mcq_id} not found")
            
            pack_mcq = PackMCQ(pack_id=pack.id, mcq_id=mcq_id, position=index)
            db.add(pack_mcq)
    
    db.commit()
    db.refresh(pack)
    
    # Return formatted response
    mcq_data = [
        {"id": pm.mcq.id, "title": pm.mcq.title, "question_text": pm.mcq.question_text}
        for pm in pack.mcqs
    ]
    
    return AdminPackResponse(
        id=pack.id,
        title=pack.title,
        description=pack.description,
        type=pack.type,
        university_id=pack.university_id,
        university_name=pack.university.name if pack.university else None,
        image_url=pack.image_url,
        price=pack.price,
        currency=pack.currency,
        start_datetime=pack.start_datetime,
        expiry_datetime=pack.expiry_datetime,
        display_before_start=pack.display_before_start,
        time_limit_minutes=pack.time_limit_minutes,
        is_published=pack.is_published,
        created_at=pack.created_at,
        created_by=pack.created_by,
        creator_name=pack.creator_name,
        mcqs=mcq_data
    )


@router.get("/mock-exams/{exam_id}", response_model=AdminPackResponse)
async def get_mock_exam_admin(
    exam_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a mock exam by ID (admin only)."""
    require_admin(current_user)
    
    pack = db.query(Pack).filter_by(id=exam_id, type="mock_exam").first()
    if not pack:
        raise HTTPException(status_code=404, detail="Mock exam not found")
    
    mcq_data = [
        {"id": pm.mcq.id, "title": pm.mcq.title, "question_text": pm.mcq.question_text}
        for pm in pack.mcqs
    ]
    
    return AdminPackResponse(
        id=pack.id,
        title=pack.title,
        description=pack.description,
        type=pack.type,
        university_id=pack.university_id,
        university_name=pack.university.name if pack.university else None,
        image_url=pack.image_url,
        price=pack.price,
        currency=pack.currency,
        start_datetime=pack.start_datetime,
        expiry_datetime=pack.expiry_datetime,
        display_before_start=pack.display_before_start,
        time_limit_minutes=pack.time_limit_minutes,
        is_published=pack.is_published,
        created_at=pack.created_at,
        created_by=pack.created_by,
        creator_name=pack.creator_name,
        mcqs=mcq_data
    )


@router.put("/mock-exams/{exam_id}", response_model=AdminPackResponse)
async def update_mock_exam_admin(
    exam_id: str,
    pack_data: AdminPackUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a mock exam (admin only)."""
    require_admin(current_user)
    
    pack = db.query(Pack).filter_by(id=exam_id, type="mock_exam").first()
    if not pack:
        raise HTTPException(status_code=404, detail="Mock exam not found")
    
    # Update basic fields
    if pack_data.title:
        pack.title = pack_data.title
    if pack_data.description:
        pack.description = pack_data.description
    if pack_data.price is not None:
        pack.price = pack_data.price
    if pack_data.currency:
        pack.currency = pack_data.currency
    if pack_data.start_datetime:
        pack.start_datetime = pack_data.start_datetime
    if pack_data.expiry_datetime:
        pack.expiry_datetime = pack_data.expiry_datetime
    if pack_data.display_before_start is not None:
        pack.display_before_start = pack_data.display_before_start
    if pack_data.time_limit_minutes is not None:
        pack.time_limit_minutes = pack_data.time_limit_minutes
    if pack_data.image_url is not None:
        pack.image_url = pack_data.image_url
    if pack_data.is_published is not None:
        pack.is_published = pack_data.is_published
    
    # Update MCQs if provided
    if pack_data.mcq_ids is not None:
        # Remove old MCQs
        for pm in pack.mcqs:
            db.delete(pm)
        
        # Add new MCQs
        for index, mcq_id in enumerate(pack_data.mcq_ids, start=1):
            mcq = db.query(MCQ).filter_by(id=mcq_id).first()
            if not mcq:
                db.rollback()
                raise HTTPException(status_code=404, detail=f"MCQ {mcq_id} not found")
            
            pack_mcq = PackMCQ(pack_id=pack.id, mcq_id=mcq_id, position=index)
            db.add(pack_mcq)
    
    db.commit()
    db.refresh(pack)
    
    # Return formatted response
    mcq_data = [
        {"id": pm.mcq.id, "title": pm.mcq.title, "question_text": pm.mcq.question_text}
        for pm in pack.mcqs
    ]
    
    return AdminPackResponse(
        id=pack.id,
        title=pack.title,
        description=pack.description,
        type=pack.type,
        university_id=pack.university_id,
        university_name=pack.university.name if pack.university else None,
        image_url=pack.image_url,
        price=pack.price,
        currency=pack.currency,
        start_datetime=pack.start_datetime,
        expiry_datetime=pack.expiry_datetime,
        display_before_start=pack.display_before_start,
        time_limit_minutes=pack.time_limit_minutes,
        is_published=pack.is_published,
        created_at=pack.created_at,
        created_by=pack.created_by,
        creator_name=pack.creator_name,
        mcqs=mcq_data
    )


@router.delete("/mock-exams/{exam_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mock_exam_admin(
    exam_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a mock exam (admin only)."""
    require_admin(current_user)
    
    pack = db.query(Pack).filter_by(id=exam_id, type="mock_exam").first()
    if not pack:
        raise HTTPException(status_code=404, detail="Mock exam not found")
    
    # Delete associated MCQs (they'll be cascade deleted)
    db.delete(pack)
    db.commit()


# ============= UNIVERSITIES MANAGEMENT =============

@router.get("/universities", response_model=List[UniversityResponse])
async def list_universities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all universities (admin only)."""
    require_admin(current_user)
    
    universities = db.query(University).order_by(University.created_at.desc()).all()
    return universities


@router.post("/universities", response_model=UniversityResponse, status_code=status.HTTP_201_CREATED)
async def create_university(
    university_data: UniversityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new university (admin only)."""
    require_admin(current_user)
    
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


@router.get("/universities/{university_id}", response_model=UniversityResponse)
async def get_university(
    university_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single university (admin only)."""
    require_admin(current_user)
    
    university = db.query(University).filter(University.id == university_id).first()
    
    if not university:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="University not found"
        )
    
    return university


@router.put("/universities/{university_id}", response_model=UniversityResponse)
async def update_university(
    university_id: str,
    university_data: UniversityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a university (admin only)."""
    require_admin(current_user)
    
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


@router.delete("/universities/{university_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_university(
    university_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a university (admin only). Cascade delete will handle related records."""
    require_admin(current_user)
    
    university = db.query(University).filter(University.id == university_id).first()
    
    if not university:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="University not found"
        )
    
    db.delete(university)
    db.commit()
    
    return None


# ============= SUBJECTS MANAGEMENT =============

@router.get("/subjects", response_model=List[SubjectResponse])
async def list_subjects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all subjects (admin only)."""
    require_admin(current_user)
    
    subjects = db.query(Subject).order_by(Subject.created_at.desc()).all()
    return subjects


@router.post("/subjects", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
async def create_subject(
    subject_data: SubjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new subject (admin only)."""
    require_admin(current_user)
    
    # Check if university exists
    university = db.query(University).filter(
        University.id == subject_data.university_id
    ).first()
    
    if not university:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="University not found"
        )
    
    # Check if subject with same name already exists for this university
    existing_subject = db.query(Subject).filter(
        Subject.name == subject_data.name,
        Subject.university_id == subject_data.university_id
    ).first()
    
    if existing_subject:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject with this name already exists for this university"
        )
    
    # Combine first + last name with email fallback
    creator_name = (
        f"{current_user.first_name} {current_user.last_name}".strip()
        if current_user.first_name or current_user.last_name
        else current_user.email
    )
    
    # Create new subject
    new_subject = Subject(
        name=subject_data.name,
        university_id=subject_data.university_id,
        created_by=current_user.id,
        creator_name=creator_name
    )
    
    db.add(new_subject)
    db.commit()
    db.refresh(new_subject)
    
    return new_subject


@router.get("/subjects/{subject_id}", response_model=SubjectResponse)
async def get_subject(
    subject_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single subject (admin only)."""
    require_admin(current_user)
    
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    return subject


@router.put("/subjects/{subject_id}", response_model=SubjectResponse)
async def update_subject(
    subject_id: str,
    subject_data: SubjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a subject (admin only)."""
    require_admin(current_user)
    
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    # Check if new university exists if being updated
    if subject_data.university_id:
        university = db.query(University).filter(
            University.id == subject_data.university_id
        ).first()
        
        if not university:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="University not found"
            )
        subject.university_id = subject_data.university_id
    
    # Check for duplicate name if name is being updated
    if subject_data.name and subject_data.name != subject.name:
        existing_subject = db.query(Subject).filter(
            Subject.name == subject_data.name,
            Subject.university_id == subject.university_id
        ).first()
        
        if existing_subject:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Subject with this name already exists for this university"
            )
        subject.name = subject_data.name
    
    db.commit()
    db.refresh(subject)
    
    return subject


@router.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(
    subject_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a subject (admin only). Cascade delete will handle related records (lessons, etc)."""
    require_admin(current_user)
    
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    db.delete(subject)
    db.commit()
    
    return None


# ============= LESSONS MANAGEMENT =============

@router.get("/lessons", response_model=List[LessonResponse])
async def list_lessons(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all lessons (admin only)."""
    require_admin(current_user)
    
    lessons = db.query(Lesson).order_by(Lesson.created_at.desc()).all()
    return lessons


@router.post("/lessons", response_model=LessonResponse, status_code=status.HTTP_201_CREATED)
async def create_lesson(
    lesson_data: LessonCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new lesson (admin only)."""
    require_admin(current_user)
    
    # Check if university exists
    university = db.query(University).filter(
        University.id == lesson_data.university_id
    ).first()
    
    if not university:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="University not found"
        )
    
    # Check if subject exists and belongs to this university
    subject = db.query(Subject).filter(
        Subject.id == lesson_data.subject_id,
        Subject.university_id == lesson_data.university_id
    ).first()
    
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found or does not belong to this university"
        )
    
    # Check if lesson with same name already exists for this subject
    existing_lesson = db.query(Lesson).filter(
        Lesson.name == lesson_data.name,
        Lesson.subject_id == lesson_data.subject_id
    ).first()
    
    if existing_lesson:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lesson with this name already exists for this subject"
        )
    
    # Combine first + last name with email fallback
    creator_name = (
        f"{current_user.first_name} {current_user.last_name}".strip()
        if current_user.first_name or current_user.last_name
        else current_user.email
    )
    
    # Create new lesson
    new_lesson = Lesson(
        name=lesson_data.name,
        university_id=lesson_data.university_id,
        subject_id=lesson_data.subject_id,
        created_by=current_user.id,
        creator_name=creator_name
    )
    
    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)
    
    return new_lesson


@router.get("/lessons/{lesson_id}", response_model=LessonResponse)
async def get_lesson(
    lesson_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single lesson (admin only)."""
    require_admin(current_user)
    
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    
    return lesson


@router.put("/lessons/{lesson_id}", response_model=LessonResponse)
async def update_lesson(
    lesson_id: str,
    lesson_data: LessonUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a lesson (admin only)."""
    require_admin(current_user)
    
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    
    # Check for duplicate name if name is being updated
    if lesson_data.name and lesson_data.name != lesson.name:
        existing_lesson = db.query(Lesson).filter(
            Lesson.name == lesson_data.name,
            Lesson.subject_id == lesson.subject_id
        ).first()
        
        if existing_lesson:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lesson with this name already exists for this subject"
            )
        lesson.name = lesson_data.name
    
    db.commit()
    db.refresh(lesson)
    
    return lesson


@router.delete("/lessons/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lesson(
    lesson_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a lesson (admin only). Cascade delete will handle related records (MCQs, etc)."""
    require_admin(current_user)
    
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    
    db.delete(lesson)
    db.commit()
    
    return None


@router.get("/question_types")
async def get_question_types(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all question types (admin only)."""
    require_admin(current_user)
    
    question_types = db.query(QuestionType).order_by(QuestionType.created_at.desc()).all()
    return question_types


@router.post("/question_types", response_model=QuestionTypeResponse, status_code=status.HTTP_201_CREATED)
async def create_question_type(
    question_type_data: QuestionTypeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new question type (admin only)."""
    require_admin(current_user)
    
    # Check duplicate name
    existing = db.query(QuestionType).filter(
        QuestionType.name == question_type_data.name
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question type with this name already exists"
        )

    creator_name = (
        f"{current_user.first_name} {current_user.last_name}".strip()
        if current_user.first_name or current_user.last_name
        else current_user.email
    )

    new_question_type = QuestionType(
        name=question_type_data.name,
        number_of_options=question_type_data.number_of_options,
        answer_mode=question_type_data.answer_mode,
        partial_credit=question_type_data.partial_credit,
        created_by=current_user.id,
        creator_name=creator_name
    )

    db.add(new_question_type)
    db.commit()
    db.refresh(new_question_type)

    return new_question_type


@router.put("/question_types/{question_type_id}", response_model=QuestionTypeResponse)
async def update_question_type(
    question_type_id: str,
    question_type_data: QuestionTypeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a question type (admin only)."""
    require_admin(current_user)
    
    question_type = db.query(QuestionType).filter(QuestionType.id == question_type_id).first()

    if not question_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question type not found"
        )

    # Check duplicate name if updated
    if question_type_data.name and question_type_data.name != question_type.name:
        existing = db.query(QuestionType).filter(
            QuestionType.name == question_type_data.name
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Question type with this name already exists"
            )
        question_type.name = question_type_data.name

    if question_type_data.number_of_options is not None:
        question_type.number_of_options = question_type_data.number_of_options

    if question_type_data.answer_mode is not None:
        question_type.answer_mode = question_type_data.answer_mode

    if question_type_data.partial_credit is not None:
        question_type.partial_credit = question_type_data.partial_credit

    db.commit()
    db.refresh(question_type)

    return question_type


@router.delete("/question_types/{question_type_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question_type(
    question_type_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a question type (admin only)."""
    require_admin(current_user)
    
    question_type = db.query(QuestionType).filter(QuestionType.id == question_type_id).first()

    if not question_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question type not found"
        )

    db.delete(question_type)
    db.commit()

    return None


# ============= MCQs MANAGEMENT =============

@router.get("/mcqs")
async def list_mcqs(
    university_id: Optional[str] = None,
    subject_id: Optional[str] = None,
    lesson_id: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all MCQs (admin only) with pagination and optional filtering.
    - skip: number of items to skip (default 0)
    - limit: number of items to return (default 20, max 100)
    - search: search by title or question content
    """
    require_admin(current_user)
    
    # Limit max results per page
    limit = min(limit, 100)
    
    query = db.query(MCQ)
    
    # Apply filters
    if university_id:
        query = query.filter(MCQ.university_id == university_id)
    if subject_id:
        query = query.filter(MCQ.subject_id == subject_id)
    if lesson_id:
        query = query.filter(MCQ.lesson_id == lesson_id)
    
    # Search in title or question content
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (MCQ.title.ilike(search_term)) |
            (MCQ.question_text.ilike(search_term))
        )
    
    # Get total count before pagination
    total = query.count()
    
    # Apply pagination
    mcqs = query.order_by(MCQ.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": [
            {
                "id": mcq.id,
                "university_id": mcq.university_id,
                "subject_id": mcq.subject_id,
                "lesson_id": mcq.lesson_id,
                "question_type_id": mcq.question_type_id,
                "title": mcq.title,
                "question_text": mcq.question_text,
                "status": mcq.status,
                "created_at": mcq.created_at.isoformat() if mcq.created_at else None,
                "created_by": mcq.created_by,
                "creator_name": mcq.creator_name,
                "options": [
                    {
                        "id": opt.id,
                        "option_text": opt.option_text,
                        "is_correct": opt.is_correct,
                        "explanation": opt.explanation
                    }
                    for opt in mcq.options
                ]
            }
            for mcq in mcqs
        ]
    }


@router.post("/mcqs", response_model=MCQResponse, status_code=status.HTTP_201_CREATED)
async def create_mcq(
    mcq_data: MCQCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new MCQ (admin only)."""
    require_admin(current_user)
    
    # Validate university exists
    university = db.query(University).filter(University.id == mcq_data.university_id).first()
    if not university:
        raise HTTPException(status_code=404, detail="University not found")
    
    # Validate subject exists and belongs to university
    subject = db.query(Subject).filter(
        Subject.id == mcq_data.subject_id,
        Subject.university_id == mcq_data.university_id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found or doesn't belong to university")
    
    # Validate lesson exists and belongs to subject
    lesson = db.query(Lesson).filter(
        Lesson.id == mcq_data.lesson_id,
        Lesson.subject_id == mcq_data.subject_id
    ).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found or doesn't belong to subject")
    
    # Validate question type exists
    qtype = db.query(QuestionType).filter(QuestionType.id == mcq_data.question_type_id).first()
    if not qtype:
        raise HTTPException(status_code=404, detail="Question type not found")
    
    creator_name = (
        f"{current_user.first_name} {current_user.last_name}".strip()
        if current_user.first_name or current_user.last_name
        else current_user.email
    )
    
    # Create MCQ
    mcq = MCQ(
        university_id=mcq_data.university_id,
        subject_id=mcq_data.subject_id,
        lesson_id=mcq_data.lesson_id,
        question_type_id=mcq_data.question_type_id,
        title=mcq_data.title,
        question_text=mcq_data.question_text,
        status=mcq_data.status or "draft",
        created_by=current_user.id,
        creator_name=creator_name
    )
    
    db.add(mcq)
    db.flush()  # Get the MCQ ID
    
    # Add options
    for opt in mcq_data.options:
        option = MCQOption(
            mcq_id=mcq.id,
            option_text=opt.option_text,
            is_correct=opt.is_correct,
            explanation=opt.explanation
        )
        db.add(option)
    
    db.commit()
    db.refresh(mcq)
    
    return mcq


@router.get("/mcqs/{mcq_id}", response_model=MCQResponse)
async def get_mcq(
    mcq_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single MCQ (admin only)."""
    require_admin(current_user)
    
    mcq = db.query(MCQ).filter(MCQ.id == mcq_id).first()
    
    if not mcq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MCQ not found"
        )
    
    return mcq


@router.put("/mcqs/{mcq_id}", response_model=MCQResponse)
async def update_mcq(
    mcq_id: str,
    mcq_data: MCQUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an MCQ (admin only)."""
    require_admin(current_user)
    
    mcq = db.query(MCQ).filter(MCQ.id == mcq_id).first()
    
    if not mcq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MCQ not found"
        )
    
    # Update basic fields
    if mcq_data.title is not None:
        mcq.title = mcq_data.title
    
    if mcq_data.question_text is not None:
        mcq.question_text = mcq_data.question_text
    
    if mcq_data.question_type_id is not None:
        qtype = db.query(QuestionType).filter(QuestionType.id == mcq_data.question_type_id).first()
        if not qtype:
            raise HTTPException(status_code=404, detail="Question type not found")
        mcq.question_type_id = mcq_data.question_type_id
    
    if mcq_data.status is not None:
        mcq.status = mcq_data.status
    
    # Update options if provided
    if mcq_data.options is not None:
        # Delete existing options
        db.query(MCQOption).filter(MCQOption.mcq_id == mcq_id).delete()
        
        # Add new options
        for opt in mcq_data.options:
            option = MCQOption(
                mcq_id=mcq.id,
                option_text=opt.option_text,
                is_correct=opt.is_correct,
                explanation=opt.explanation
            )
            db.add(option)
    
    db.commit()
    db.refresh(mcq)
    
    return mcq


@router.delete("/mcqs/{mcq_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mcq(
    mcq_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an MCQ (admin only). Cascade delete will handle related records."""
    require_admin(current_user)
    
    mcq = db.query(MCQ).filter(MCQ.id == mcq_id).first()
    
    if not mcq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="MCQ not found"
        )
    
    db.delete(mcq)
    db.commit()
    
    return None


# ============= APPROVED MCQs VISUALIZATION =============

@router.get("/approved-mcqs")
async def get_approved_mcqs(
    university_id: Optional[str] = None,
    subject_id: Optional[str] = None,
    lesson_id: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all approved MCQs with pagination, filtering, and search (rank 5,6 only).
    - skip: number of items to skip (default 0)
    - limit: number of items to return (default 20, max 100)
    - search: search by title or MCQ ID
    """
    # Require rank 5 or 6
    if current_user.rank not in [5, 6]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to visualize approved MCQs (rank 5 or 6 required)"
        )
    
    # Limit max results per page
    limit = min(limit, 100)
    
    query = db.query(MCQ).filter(MCQ.status == "approved")
    
    # Apply filters
    if university_id:
        query = query.filter(MCQ.university_id == university_id)
    if subject_id:
        query = query.filter(MCQ.subject_id == subject_id)
    if lesson_id:
        query = query.filter(MCQ.lesson_id == lesson_id)
    
    # Apply search
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (MCQ.id.ilike(search_term)) | 
            (MCQ.title.ilike(search_term))
        )
    
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


# ============= HELPER FUNCTIONS =============

def get_role_name(rank: int) -> str:
    """Convert rank to role name."""
    roles = {
        1: "Student",
        2: "Writer",
        3: "Content Manager",
        6: "Admin"
    }
    return roles.get(rank, "Unknown")
