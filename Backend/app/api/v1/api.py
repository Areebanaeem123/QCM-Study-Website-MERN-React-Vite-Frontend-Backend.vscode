from fastapi import APIRouter
from app.api.v1.endpoints import auth, universities

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(universities.router, prefix="/universities", tags=["universities"])

