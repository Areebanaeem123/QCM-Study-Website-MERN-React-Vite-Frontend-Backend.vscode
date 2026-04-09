from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, universities, subjects, lesson, question_type, mcqs, 
    visualize_mcqs, user_router, packs, session, dashboard, 
    admin, mcq_approvals, mcq_filter_router, pack_mcq_router, 
    mock_exams_admin, question_bank_router, visualize_packs, 
    mcq_research, feedback, page_router, slider_router, 
    upload, result, basket, voucher
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authorization"])
api_router.include_router(basket.router, prefix="/basket", tags=["Basket"])
api_router.include_router(upload.router, prefix="/upload", tags=["File Upload"])
api_router.include_router(result.router, prefix="/results", tags=["Results"])
api_router.include_router(universities.router, prefix="/universities", tags=["Universities"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Management"])
api_router.include_router(subjects.router, prefix="/subjects", tags=["Subjects"])
api_router.include_router(lesson.router, prefix="/lessons", tags=["Lessons"])
api_router.include_router(question_type.router, prefix="/question_types", tags=["Question Types"])
api_router.include_router(mcqs.router, prefix="/mcqs", tags=["MCQs"])
api_router.include_router(visualize_mcqs.router, prefix="/visualize_mcqs", tags=["Visualize MCQs"])
api_router.include_router(packs.router, prefix="/packs", tags=["Packs"])
api_router.include_router(session.router, prefix="/session", tags=["Session"])
api_router.include_router(user_router.router, prefix="/user_router", tags=["Get User Details"])
api_router.include_router(mcq_filter_router.router, prefix="/mcq_filter_router", tags=["MCQ Filtering"])
api_router.include_router(pack_mcq_router.router, prefix="/pack_mcq_router", tags=["Pack MCQ Management"])
api_router.include_router(mock_exams_admin.router, prefix="/mock_exams_admin", tags=["Admin Mock Exams Operations"])
api_router.include_router(question_bank_router.router, prefix="/question_banks", tags=["Question Bank Operations"])
api_router.include_router(visualize_packs.router, prefix="/visualize_packs", tags=["Visualize Packs"])
api_router.include_router(mcq_research.router, prefix="/mcq_research", tags=["MCQ Research"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["Feedback"])
api_router.include_router(page_router.router, prefix="/pages", tags=["Frontend Page Update"])
api_router.include_router(slider_router.router, prefix="/slider", tags=["Frontend Slider Update"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(mcq_approvals.router, prefix="/approvals", tags=["MCQ Approvals"])
api_router.include_router(voucher.router, prefix="/vouchers", tags=["Vouchers"])
