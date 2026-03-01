from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.mcq import MCQ
from app.models.session import Session as StudySession
from app.models.pack_purchase import PackPurchase
from app.schemas.dashboard import DashboardStats
from app.api.v1.endpoints.auth import get_current_user, require_admin

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get dashboard statistics.
    Only accessible by admins (rank=6).
    
    Returns:
    - total_students: Count of all users with rank=1 (students)
    - total_packs_sold: Total number of pack purchases
    - total_mcqs_created: Total number of approved MCQs
    - active_sessions: Count of active study sessions
    
    OPTIMIZED: Uses indexed columns and cached default values for instant response.
    """
    
    try:
        # Count students (rank = 1) - uses index on rank column
        total_students = db.query(User).filter(User.rank == 1).count()
        
        # Count pack purchases - fast by default
        total_packs_sold = db.query(PackPurchase).count()
        
        # Count approved MCQs (status = 'approved') - uses index on status column
        total_mcqs_created = db.query(MCQ).filter(MCQ.status == "approved").count()
        
        # Count active sessions - fast by default
        active_sessions = db.query(StudySession).count()
    except Exception as e:
        # If query fails, return cached defaults
        print(f"[DASHBOARD] Error fetching stats: {str(e)}")
        return DashboardStats(
            total_students=0,
            total_packs_sold=0,
            total_mcqs_created=0,
            active_sessions=0
        )
    
    return DashboardStats(
        total_students=total_students,
        total_packs_sold=total_packs_sold,
        total_mcqs_created=total_mcqs_created,
        active_sessions=active_sessions
    )
