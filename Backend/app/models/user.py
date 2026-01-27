from sqlalchemy import Column, String, Integer, DateTime, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    # Basic identity
    civility = Column(String, nullable=True)  # Mr / Ms
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    # Contact
    address = Column(String, nullable=True)
    country = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    # Education
    diploma = Column(String, nullable=True)
    former_school = Column(String, nullable=True)
    university = Column(String, nullable=True)
    # Auth
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    # Verification & flags
    email_verified = Column(DateTime, nullable=True)
    accepted_terms = Column(Boolean, default=False)
    is_robot_verified = Column(Boolean, default=False)
    # Roles
    rank = Column(Integer, default=1)  # 1 = student, 6 = admin
    # Meta
    registration_ip = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    # Relationships
    universities = relationship(
        "University",
        back_populates="creator",
        cascade="all, delete-orphan"
    )
    lessons = relationship(
        "Lesson",
        back_populates="creator",
        cascade="all, delete-orphan"
    )       
    question_types = relationship(
        "QuestionType",
        back_populates="creator",
        cascade="all, delete-orphan"
    )