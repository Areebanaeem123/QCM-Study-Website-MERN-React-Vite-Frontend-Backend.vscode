from fastapi import APIRouter
from app.api.v1.endpoints import auth, universities , subjects , lesson ,question_type

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(universities.router, prefix="/universities", tags=["universities"])
api_router.include_router(subjects.router, prefix="/subjects",tags=["subjects"])
api_router.include_router(lesson.router, prefix="/lessons",tags=["lessons"])
api_router.include_router(question_type.router, prefix="/question_types",tags=["question_types"])