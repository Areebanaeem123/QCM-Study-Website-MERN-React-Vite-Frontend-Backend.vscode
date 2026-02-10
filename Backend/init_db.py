"""
Initialize the database by creating all tables.
Run this script once to set up the database schema.
"""
from app.core.database import Base, engine
# Import all models so SQLAlchemy knows about them
from app.models import User, University , Subject , Lesson, QuestionType , MCQ , MCQOption , MCQApproval 
from app.models import PackMCQ , Pack , Session 
from app.models import MockExam , QuestionBankPurchase , QuestionBank , question_bank_mcqs , PackPurchase , PackReview , Page
if __name__ == "__main__":
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

