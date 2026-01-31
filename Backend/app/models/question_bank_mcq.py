from sqlalchemy import Table, Column, String, ForeignKey
from app.core.database import Base

question_bank_mcqs = Table(
    "question_bank_mcqs",
    Base.metadata,
    Column("question_bank_id", String, ForeignKey("question_banks.id", ondelete="CASCADE")),
    Column("mcq_id", String, ForeignKey("mcqs.id", ondelete="CASCADE"))
)
