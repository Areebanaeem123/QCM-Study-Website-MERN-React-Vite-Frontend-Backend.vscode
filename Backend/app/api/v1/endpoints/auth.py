from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from datetime import timedelta
from fastapi import Form, Request
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import (
    UserCreate,
    UserResponse,
    LoginRequest,
    RefreshTokenRequest,
    Token,
    StudentRegister,
)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

ADMIN_RANK = 6
STUDENT_RANK = 1

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user."""
    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    return user

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require admin rank (6) to access."""
    if current_user.rank != ADMIN_RANK:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def require_pack_creator(current_user: User = Depends(get_current_user)) -> User:
    """Require rank 5 (MCQ Packer) or rank 6 (Admin) to access."""
    if current_user.rank < 5:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Pack creator or Admin access required"
        )
    return current_user

from fastapi import Request

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: StudentRegister,
    request: Request,
    db: Session = Depends(get_db)
):
    # Check email uniqueness
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )

    # Password checks
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match"
        )

    if len(user_data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters"
        )

    # Terms & robot validation
    if not user_data.accepted_terms:
        raise HTTPException(
            status_code=400,
            detail="You must accept the terms of use"
        )

    if not user_data.is_robot_verified:
        raise HTTPException(
            status_code=400,
            detail="Robot verification failed"
        )

    hashed_password = get_password_hash(user_data.password)

    new_user = User(
        civility=user_data.civility,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        date_of_birth=user_data.date_of_birth,
        address=user_data.address,
        country=user_data.country,
        phone_number=user_data.phone_number,
        diploma=user_data.diploma,
        former_school=user_data.former_school,
        university=user_data.university,
        email=user_data.email,
        password=hashed_password,
        rank=STUDENT_RANK,
        accepted_terms=True,
        is_robot_verified=True,
        registration_ip=request.client.host,
        email_verified=None  # until email confirmation
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # TODO: send verification email here

    return new_user

@router.post("/login", response_model=Token)
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Login and get access and refresh tokens.
    
    Accepts JSON: {"email": "user@example.com", "password": "password123"}
    """
    try:
        email = credentials.email
        password = credentials.password
        
        print(f"[LOGIN] Attempting login for email: {email}")

        # Validate presence
        if not email or not password:
            print(f"[LOGIN] Missing credentials - email: {bool(email)}, password: {bool(password)}")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Email and password are required"
            )

        # Authenticate
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"[LOGIN] User not found: {email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        
        if not verify_password(password, user.password):
            print(f"[LOGIN] Password verification failed for: {email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        print(f"[LOGIN] Authentication successful for: {email}")

        # Update last login timestamp
        from datetime import datetime
        user.last_login = datetime.utcnow()
        db.commit()
        print(f"[LOGIN] Database commit completed for {email}")

        # Create tokens
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.id, "email": user.email, "rank": user.rank},
            expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(
            data={"sub": user.id, "email": user.email, "rank": user.rank}
        )

        print(f"[LOGIN] Tokens created successfully for: {email}")

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[LOGIN] Unexpected error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login error: {str(e)}"
        )

@router.post("/refresh", response_model=Token)
async def refresh_token(
    token_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token."""
    payload = decode_token(token_data.refresh_token)
    
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Create new tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "rank": user.rank},
        expires_delta=access_token_expires
    )
    new_refresh_token = create_refresh_token(
        data={"sub": user.id, "email": user.email, "rank": user.rank}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user

