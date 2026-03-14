from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.slider import Slider
from app.schemas.slider import SliderCreate, SliderUpdate, SliderOut
from app.models.user import User
from app.api.v1.endpoints.auth import get_optional_current_user, require_pack_creator

router = APIRouter()

# ✅ Admin/Pack Manager create slider
@router.post("/", response_model=SliderOut)
def create_slider(
    data: SliderCreate, 
    db: Session = Depends(get_db), 
    user: User = Depends(require_pack_creator)
):
    slider = Slider(**data.model_dump())
    db.add(slider)
    db.commit()
    db.refresh(slider)
    return slider


# ✅ Admin/Pack Manager update slider
@router.put("/{slider_id}", response_model=SliderOut)
def update_slider(
    slider_id: int, 
    data: SliderUpdate, 
    db: Session = Depends(get_db), 
    user: User = Depends(require_pack_creator)
):
    slider = db.query(Slider).filter(Slider.id == slider_id).first()
    if not slider:
        raise HTTPException(status_code=404, detail="Slider not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(slider, key, value)

    db.commit()
    db.refresh(slider)
    return slider


# 🌍 Get sliders (returns all for admins/pack managers, active only for others)
@router.get("/", response_model=list[SliderOut])
def get_sliders(
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_current_user)
):
    query = db.query(Slider)
    # If not a pack manager/admin, only show active ones
    if not user or user.rank < 5:
        query = query.filter(Slider.is_active == True)
    
    return query.order_by(Slider.id.desc()).all()


@router.delete("/{slider_id}")
def delete_slider(
    slider_id: int, 
    db: Session = Depends(get_db), 
    user: User = Depends(require_pack_creator)
):
    slider = db.query(Slider).filter(Slider.id == slider_id).first()
    if not slider:
        raise HTTPException(status_code=404, detail="Slider not found")
    db.delete(slider)
    db.commit()
    return {"message": "Slider deleted"}
