from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.slider import Slider
from app.schemas.slider import SliderCreate, SliderUpdate, SliderOut
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

def require_admin(user: User):
    if user.rank != 6:
        raise HTTPException(status_code=403, detail="Admin only")


# ✅ Admin create slider
@router.post("/", response_model=SliderOut)
def create_slider(data: SliderCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_admin(user)
    slider = Slider(**data.dict())
    db.add(slider)
    db.commit()
    db.refresh(slider)
    return slider


# ✅ Admin update slider
@router.put("/{slider_id}", response_model=SliderOut)
def update_slider(slider_id: int, data: SliderUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_admin(user)

    slider = db.query(Slider).filter(Slider.id == slider_id).first()
    if not slider:
        raise HTTPException(status_code=404, detail="Slider not found")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(slider, key, value)

    db.commit()
    db.refresh(slider)
    return slider


# 🌍 Public get active sliders (frontend homepage)
@router.get("/", response_model=list[SliderOut])
def get_sliders(db: Session = Depends(get_db)):
    return db.query(Slider).filter(Slider.is_active == True).all()
