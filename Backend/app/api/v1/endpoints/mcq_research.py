from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.mcq import MCQ
from app.schemas.mcq import MCQResponse
from app.api.v1.endpoints.auth import get_current_user


router = APIRouter()

# ✅ Only rank 5 & 6
def require_pack_creator_or_admin(user: User = Depends(get_current_user)):
    if user.rank not in [5, 6]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return user
@router.get("/", response_model=List[MCQResponse])
def research_mcqs(
    keyword: str = Query(None, description="Keyword to search in title or question text"),
    mcq_id: str = Query(None, description="Exact MCQ ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_pack_creator_or_admin)
):
    query = db.query(MCQ)
    # 🔍 Search by exact ID
    if mcq_id:
        mcq = query.filter(MCQ.id == mcq_id).first()
        if not mcq:
            raise HTTPException(status_code=404, detail="MCQ not found")
        return [mcq]

    # 🔍 Search by keyword (title OR question text)
    if keyword:
        query = query.filter(
            (MCQ.title.ilike(f"%{keyword}%")) |
            (MCQ.question_text.ilike(f"%{keyword}%"))
        )

    results = query.order_by(MCQ.created_at.desc()).all()

    if not results:
        raise HTTPException(status_code=404, detail="No MCQs found")

    return results
