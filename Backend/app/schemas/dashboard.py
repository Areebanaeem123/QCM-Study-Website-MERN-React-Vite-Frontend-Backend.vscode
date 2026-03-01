from pydantic import BaseModel

class DashboardStats(BaseModel):
    """Dashboard statistics response"""
    total_students: int
    total_packs_sold: int
    total_mcqs_created: int
    active_sessions: int
