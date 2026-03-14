from pydantic import BaseModel

from typing import List, Dict

class DashboardStats(BaseModel):
    """Admin dashboard statistics response"""
    total_students: int
    total_packs_sold: int
    total_mcqs_created: int
    active_sessions: int
    total_online_users: int
    sales_over_time: List[Dict]

class RecentActivity(BaseModel):
    id: str
    user_name: str
    type: str # e.g. "Connexion", "Achat de Pack"
    timestamp: str

class DashboardSubject(BaseModel):
    id: str
    name: str

class PurchasedPack(BaseModel):
    id: str
    name: str
    type: str # "pack", "question_bank", "mock_exam"
    progress: int
    total_qcm: int
    completed_qcm: int
    subjects: List[DashboardSubject] = []

class StudentDashboardStats(BaseModel):
    """Student dashboard statistics response"""
    completed_mcqs: int
    average_score: float
    rank: int
    progression: float
    recent_activity: List[RecentActivity]
    purchased_packs: List[PurchasedPack]
    category_performance: List[Dict]
