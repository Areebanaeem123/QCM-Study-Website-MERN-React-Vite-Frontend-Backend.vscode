from pydantic import BaseModel

from typing import List, Dict

class DashboardStats(BaseModel):
    """Dashboard statistics response"""
    total_students: int
    total_packs_sold: int
    total_mcqs_created: int
    active_sessions: int
    total_online_users: int
    sales_over_time: List[Dict] # List of {"date": "YYYY-MM-DD", "count": int}
