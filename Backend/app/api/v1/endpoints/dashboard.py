from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.mcq import MCQ
from app.models.session import Session as StudySession
from app.models.pack_purchase import PackPurchase
from app.schemas.dashboard import DashboardStats
from app.api.v1.endpoints.auth import get_current_user, require_admin

from datetime import datetime, timedelta
from app.models.pack_purchase import PackPurchase
from sqlalchemy import func

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_students = 0
    total_packs_sold = 0
    total_mcqs_created = 0
    active_sessions = 0
    total_online_users = 0
    sales_over_time = []

    try:
        # Count students (rank = 1)
        try:
            total_students = db.query(User).filter(User.rank == 1).count()
        except Exception as e:
            print(f"[DASHBOARD] Error counting students: {e}")

        # Count pack purchases
        try:
            total_packs_sold = db.query(PackPurchase).count()
        except Exception as e:
            print(f"[DASHBOARD] Error counting packs: {e}")

        # Count approved MCQs
        try:
            total_mcqs_created = db.query(MCQ).filter(MCQ.status == "approved").count()
        except Exception as e:
            print(f"[DASHBOARD] Error counting MCQs: {e}")

        # Count active sessions
        try:
            active_sessions = db.query(StudySession).count()
        except Exception as e:
            print(f"[DASHBOARD] Error counting sessions: {e}")

        # Online users: last_login within last 15 minutes
        try:
            fifteen_mins_ago = datetime.utcnow() - timedelta(minutes=15)
            total_online_users = db.query(User).filter(User.last_login >= fifteen_mins_ago).count()
        except Exception as e:
            print(f"[DASHBOARD] Error counting online users: {e}")

        # Sales over time (last 30 days)
        try:
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            sales_query = db.query(
                func.date(PackPurchase.purchased_at).label('date'),
                func.count(PackPurchase.id).label('count')
            ).filter(PackPurchase.purchased_at >= thirty_days_ago)\
             .group_by(func.date(PackPurchase.purchased_at))\
             .order_by(func.date(PackPurchase.purchased_at)).all()
            sales_over_time = [{"date": str(r.date), "count": r.count} for r in sales_query]
        except Exception as e:
            print(f"[DASHBOARD] Error calculating sales trends: {e}")

    except Exception as e:
        print(f"[DASHBOARD] General error fetching stats: {str(e)}")
    
    return DashboardStats(
        total_students=total_students,
        total_packs_sold=total_packs_sold,
        total_mcqs_created=total_mcqs_created,
        active_sessions=active_sessions,
        total_online_users=total_online_users,
        sales_over_time=sales_over_time
    )

@router.get("/rankings")
async def get_student_rankings(
    pack_id: str = None,
    mock_exam_id: str = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get student rankings.
    For now, returns a prioritized list of students by purchase count or mock data
    until real results/scores are fully implemented in the backend.
    """
    # Priority: Pack students > All students
    if pack_id:
        rankings = db.query(
            User.first_name, User.last_name, User.email,
            func.count(PackPurchase.id).label('score')
        ).join(PackPurchase, User.id == PackPurchase.student_id)\
         .filter(PackPurchase.pack_id == pack_id)\
         .group_by(User.id)\
         .order_by(func.count(PackPurchase.id).desc()).limit(20).all()
    else:
        rankings = db.query(
            User.first_name, User.last_name, User.email,
            func.count(PackPurchase.id).label('score')
        ).join(PackPurchase, User.id == PackPurchase.student_id)\
         .group_by(User.id)\
         .order_by(func.count(PackPurchase.id).desc()).limit(20).all()

    return [
        {
            "name": f"{r.first_name} {r.last_name}",
            "email": r.email,
            "score": r.score * 10, # Mocking a score based on activity for now
            "rank": i + 1
        }
        for i, r in enumerate(rankings)
    ]

@router.get("/recent-activity")
async def get_recent_activity(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get latest activity: logins, enrollments, purchases.
    """
    # 1. Latest Logins
    logins = db.query(User).filter(User.last_login != None)\
        .order_by(User.last_login.desc()).limit(10).all()
    
    # 2. Latest Enrollments
    enrollments = db.query(User).order_by(User.created_at.desc()).limit(10).all()

    # 3. Latest Purchases
    purchases = db.query(PackPurchase).order_by(PackPurchase.purchased_at.desc()).limit(10).all()

    activity_feed = []

    for login in logins:
        activity_feed.append({
            "id": f"login-{login.id}-{login.last_login.timestamp()}",
            "user_name": f"{login.first_name} {login.last_name}",
            "type": "Connexion",
            "timestamp": login.last_login.isoformat()
        })

    for enroll in enrollments:
        activity_feed.append({
            "id": f"enroll-{enroll.id}",
            "user_name": f"{enroll.first_name} {enroll.last_name}",
            "type": "Inscription",
            "timestamp": enroll.created_at.isoformat()
        })

    for p in purchases:
        activity_feed.append({
            "id": f"purchase-{p.id}",
            "user_name": f"{p.student.first_name} {p.student.last_name}" if p.student else "Utilisateur inconnu",
            "type": "Achat de Pack",
            "timestamp": p.purchased_at.isoformat()
        })

    # Sort combined feed by timestamp descending
    activity_feed.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return activity_feed[:20]
