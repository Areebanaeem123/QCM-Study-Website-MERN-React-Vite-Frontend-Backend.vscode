from sqlalchemy import Column, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid
class MCQOption(Base):
    __tablename__ = "mcq_options"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    mcq_id = Column(String, ForeignKey("mcqs.id", ondelete="CASCADE"), nullable=False)

    option_text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)

    explanation = Column(Text, nullable=True)

    mcq = relationship("MCQ", back_populates="options")
