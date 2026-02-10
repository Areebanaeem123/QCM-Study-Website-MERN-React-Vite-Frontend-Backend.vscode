from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.page import Page
from app.schemas.page import PageCreate, PageUpdate, PageOut
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

def require_admin(user: User):
    if user.rank != 6:
        raise HTTPException(status_code=403, detail="Admin only")


# ✅ Admin create page
@router.post("/", response_model=PageOut)
def create_page(data: PageCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_admin(user)

    page = Page(**data.dict())
    db.add(page)
    db.commit()
    db.refresh(page)
    return page


# ✅ Admin update page
@router.put("/{slug}", response_model=PageOut)
def update_page(slug: str, data: PageUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_admin(user)

    page = db.query(Page).filter(Page.slug == slug).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(page, key, value)

    db.commit()
    db.refresh(page)
    return page


# 🌍 Public fetch page (frontend will use this)
@router.get("/{slug}", response_model=PageOut)
def get_page(slug: str, db: Session = Depends(get_db)):
    page = db.query(Page).filter(Page.slug == slug).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page
