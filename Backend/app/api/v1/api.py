from fastapi import APIRouter
from app.api.v1.endpoints import auth, universities , subjects , lesson ,question_type , mcqs , visualize_mcqs , user_router , packs , session
from app.api.v1.endpoints import mcq_filter_router, pack_mcq_router , mock_exams_admin, question_bank_router
api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authorization"])
api_router.include_router(universities.router, prefix="/universities", tags=["Universities"])
api_router.include_router(subjects.router, prefix="/subjects",tags=["Subjects"])
api_router.include_router(lesson.router, prefix="/lessons",tags=["Lessons"])
api_router.include_router(question_type.router, prefix="/question_types",tags=["Question Types"])
api_router.include_router(mcqs.router , prefix="/mcqs",tags=["MCQs"])
api_router.include_router(visualize_mcqs.router , prefix="/visualize_mcqs" , tags=["visualize MCQs"])
api_router.include_router(packs.router, prefix="/packs",tags=["Packs"])
api_router.include_router(session.router, prefix="/session", tags=["Session"])
api_router.include_router(user_router .router , prefix="/user_router",tags=["Get User Details"])
api_router.include_router(mcq_filter_router.router , prefix="/mcq_filter_router", tags=["MCQ Filtering"])
api_router.include_router(pack_mcq_router.router , prefix="/pack_mcq_router", tags=["Pack MCQ Management"])
api_router.include_router(mock_exams_admin.router , prefix="/mock_exams_admin", tags=["Admin Mock Exams Operations"])
api_router.include_router(question_bank_router.router , prefix="/question_bank_router", tags=["Question Bank operations"])


