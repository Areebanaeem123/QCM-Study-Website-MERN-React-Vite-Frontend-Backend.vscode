from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid
class PackMCQ(Base):
    __tablename__ = "pack_mcqs"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pack_id = Column(String, ForeignKey("packs.id", ondelete="CASCADE"), nullable=False)
    mcq_id = Column(String, ForeignKey("mcqs.id", ondelete="CASCADE"), nullable=False)

    # Order of MCQ inside the pack (important for exams)
    position = Column(Integer, nullable=False)

    # Relationships
    pack = relationship("Pack", back_populates="mcqs")
    mcq = relationship("MCQ")
