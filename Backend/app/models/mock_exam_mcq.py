from sqlalchemy import Table, Column, ForeignKey, String
from app.core.database import Base

mock_exam_mcqs = Table(
    "mock_exam_mcqs",
    Base.metadata,
    Column("mock_exam_id", String, ForeignKey("mock_exams.id", ondelete="CASCADE"), primary_key=True),
    Column("mcq_id", String, ForeignKey("mcqs.id", ondelete="CASCADE"), primary_key=True),
)
