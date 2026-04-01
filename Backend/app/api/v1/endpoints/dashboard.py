from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.mcq import MCQ
from app.models.session import Session as StudySession
from app.models.pack_purchase import PackPurchase
from app.schemas.dashboard import DashboardStats, StudentDashboardStats
from app.api.v1.endpoints.auth import get_current_user, require_admin

from datetime import datetime, timedelta
from app.models.pack_purchase import PackPurchase
from app.models.pack import Pack
from app.models.question_bank import QuestionBank
from app.models.question_bank_purchase import QuestionBankPurchase
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
    subject_id: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get student rankings.
    - If subject_id is provided, ranks by average correct rate of responses in that subject.
    - Otherwise, ranks by average score of QuizAttempts filtered by pack/mock_exam.
    - Anonymous for peers (only current user's name is visible).
    """
    from app.models.result import QuizAttempt, QuizResponse
    from app.models.mcq import MCQ

    if subject_id:
        # Per-subject ranking: Average correctness of all responses for this subject
        query = db.query(
            User.id, 
            User.first_name, 
            User.last_name, 
            User.email,
            func.avg(func.cast(QuizResponse.is_correct, Float)).label('score')
        ).join(QuizResponse, User.id == QuizResponse.attempt_id) \
         .join(QuizAttempt, QuizAttempt.id == QuizResponse.attempt_id) \
         .join(MCQ, MCQ.id == QuizResponse.mcq_id) \
         .filter(MCQ.subject_id == subject_id) \
         .group_by(User.id) \
         .order_by(func.avg(func.cast(QuizResponse.is_correct, Float)).desc())
    else:
        # Generic/Pack/Exam ranking: Average score of attempts
        query = db.query(
            User.id, 
            User.first_name, 
            User.last_name, 
            User.email,
            func.avg(QuizAttempt.score).label('score')
        ).join(QuizAttempt, User.id == QuizAttempt.user_id)
        
        if mock_exam_id:
            query = query.filter(QuizAttempt.mock_exam_id == mock_exam_id)
        elif pack_id:
            query = query.filter(QuizAttempt.pack_id == pack_id)
            
        query = query.group_by(User.id).order_by(func.avg(QuizAttempt.score).desc())

    # Execute query
    results = query.limit(50).all()

    # Format with anonymity
    rankings = []
    for i, r in enumerate(results):
        score_val = round(r.score, 1) if subject_id else round(r.score or 0.0, 1)
        if subject_id: # Convert to percentage if it was a fraction
             score_val = round(score_val * 100, 1)
             
        is_me = r.email == current_user.email
        rankings.append({
            "name": f"{r.first_name} {r.last_name}" if is_me else f"Étudiant #{i+1}",
            "email": r.email if is_me else f"hidden-{i}@qcm.study",
            "score": score_val,
            "rank": i + 1,
            "is_me": is_me
        })

    return rankings

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

@router.get("/student/stats", response_model=StudentDashboardStats)
async def get_student_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get student-specific dashboard statistics.
    """
    # 1. Fetch Purchased Packs & Question Banks
    purchased_packs = []
    purchases = []
    qb_purchases = []
    
    # If user is admin (rank 5 or 6), they see everything published
    if current_user.rank >= 5:
        # Get all published packs
        all_packs = db.query(Pack).filter(Pack.is_published == True).all()
        for pack in all_packs:
            # Efficiently get unique subjects for this pack
            from app.models.subject import Subject
            from app.models.mcq import MCQ
            from app.models.pack_mcq import PackMCQ

            subjects = db.query(Subject.id, Subject.name)\
                         .join(MCQ, MCQ.subject_id == Subject.id)\
                         .join(PackMCQ, PackMCQ.mcq_id == MCQ.id)\
                         .filter(PackMCQ.pack_id == pack.id)\
                         .distinct().all()
            
            pack_subjects = [{"id": str(s.id), "name": s.name} for s in subjects]

            purchased_packs.append({
                "id": str(pack.id),
                "name": pack.title,
                "type": pack.type,
                "progress": 0,
                "total_qcm": db.query(PackMCQ).filter(PackMCQ.pack_id == pack.id).count(),
                "completed_qcm": 0,
                "subjects": pack_subjects
            })
        
        # Get all published question banks
        all_qbs = db.query(QuestionBank).filter(QuestionBank.is_published == True).all()
        for qb in all_qbs:
            # Efficiently get unique subjects for this question bank
            from app.models.question_bank_mcq import question_bank_mcqs
            
            subjects = db.query(Subject.id, Subject.name)\
                         .join(MCQ, MCQ.subject_id == Subject.id)\
                         .join(question_bank_mcqs, question_bank_mcqs.c.mcq_id == MCQ.id)\
                         .filter(question_bank_mcqs.c.question_bank_id == qb.id)\
                         .distinct().all()

            qb_subjects = [{"id": str(s.id), "name": s.name} for s in subjects]

            purchased_packs.append({
                "id": str(qb.id),
                "name": qb.title,
                "type": "question_bank",
                "progress": 0,
                "total_qcm": len(qb.mcqs) if qb.mcqs else 0,
                "completed_qcm": 0,
                "subjects": qb_subjects
            })
    else:
        # Regular student - Only show items they have actually purchased
        # 1. Fetch Pack Purchases (includes "pack" and "mock_exam" types)
        purchases = db.query(PackPurchase).filter(PackPurchase.student_id == current_user.id).all()
        for p in purchases:
            pack = p.pack
            if not pack or not pack.is_published:
                continue
                
            from app.models.subject import Subject
            from app.models.mcq import MCQ
            from app.models.pack_mcq import PackMCQ

            subjects = db.query(Subject.id, Subject.name)\
                         .join(MCQ, MCQ.subject_id == Subject.id)\
                         .join(PackMCQ, PackMCQ.mcq_id == MCQ.id)\
                         .filter(PackMCQ.pack_id == pack.id)\
                         .distinct().all()

            pack_subjects = [{"id": str(s.id), "name": s.name} for s in subjects]

            purchased_packs.append({
                "id": str(pack.id),
                "name": pack.title,
                "type": pack.type,
                "progress": 0,
                "total_qcm": db.query(PackMCQ).filter(PackMCQ.pack_id == pack.id).count(),
                "completed_qcm": 0,
                "subjects": pack_subjects
            })
            
        # 2. Fetch Question Bank Purchases
        qb_purchases = db.query(QuestionBankPurchase).filter(QuestionBankPurchase.user_id == current_user.id).all()
        for qp in qb_purchases:
            qb = qp.question_bank
            if not qb or not qb.is_published:
                continue
                
            from app.models.question_bank_mcq import question_bank_mcqs
            from app.models.subject import Subject
            from app.models.mcq import MCQ

            subjects = db.query(Subject.id, Subject.name)\
                         .join(MCQ, MCQ.subject_id == Subject.id)\
                         .join(question_bank_mcqs, question_bank_mcqs.c.mcq_id == MCQ.id)\
                         .filter(question_bank_mcqs.c.question_bank_id == qb.id)\
                         .distinct().all()

            qb_subjects = [{"id": str(s.id), "name": s.name} for s in subjects]

            purchased_packs.append({
                "id": str(qb.id),
                "name": qb.title,
                "type": "question_bank",
                "progress": 0,
                "total_qcm": len(qb.mcqs) if qb.mcqs else 0,
                "completed_qcm": 0,
                "subjects": qb_subjects
            })

    # Fetch Recent Activity for this student
    # (Existing activity logic remains same, but we use purchases list which might need to be re-queried if we want real activity)
    # Re-query purchases for activity feed specifically
    purchases = db.query(PackPurchase).filter(PackPurchase.student_id == current_user.id).all()
    activity_feed = []
    # Logins (latest only)
    if current_user.last_login:
        activity_feed.append({
            "id": f"login-{current_user.id}",
            "user_name": f"{current_user.first_name} {current_user.last_name}",
            "type": "Connexion",
            "timestamp": current_user.last_login.isoformat()
        })
    # Purchases
    for p in purchases:
        activity_feed.append({
            "id": f"purchase-{p.id}",
            "user_name": f"{current_user.first_name} {current_user.last_name}",
            "type": "Achat de Pack",
            "timestamp": p.purchased_at.isoformat()
        })
    
    # Sort activity feed by timestamp descending
    activity_feed.sort(key=lambda x: x["timestamp"], reverse=True)

    # 3. Stats Summary (Real data from QuizAttempts)
    from app.models.result import QuizAttempt
    
    # Total completed MCQs (sum of total_questions in all attempts or sum of correct_answers? Usually total_questions means how many were answered)
    completed_mcqs = db.query(func.sum(QuizAttempt.total_questions))\
                       .filter(QuizAttempt.user_id == current_user.id).scalar() or 0
    
    # Average score
    avg_score = db.query(func.avg(QuizAttempt.score))\
                  .filter(QuizAttempt.user_id == current_user.id).scalar() or 0.0
    
    # Recent attempts for activity feed
    recent_attempts = db.query(QuizAttempt)\
                        .filter(QuizAttempt.user_id == current_user.id)\
                        .order_by(QuizAttempt.created_at.desc())\
                        .limit(5).all()
    
    for attempt in recent_attempts:
        activity_feed.append({
            "id": f"attempt-{attempt.id}",
            "user_name": f"{current_user.first_name} {current_user.last_name}",
            "type": f"QCM Complété ({int(attempt.score)}%)",
            "timestamp": attempt.created_at.isoformat()
        })
    
    # Re-sort with new activity
    activity_feed.sort(key=lambda x: x["timestamp"], reverse=True)

    return StudentDashboardStats(
        completed_mcqs=int(completed_mcqs),
        average_score=float(round(avg_score, 1)),
        rank=0, # Rank tracking not implemented yet
        progression=0.0,
        recent_activity=activity_feed[:10],
        purchased_packs=purchased_packs,
        category_performance=[
            {"name": "Anatomy", "score": 0, "color": "bg-green-500"},
            {"name": "Biochemistry", "score": 0, "color": "bg-yellow-500"},
            {"name": "Pharmacology", "score": 0, "color": "bg-orange-500"},
            {"name": "Physiology", "score": 0, "color": "bg-blue-500"}
        ]
    )
