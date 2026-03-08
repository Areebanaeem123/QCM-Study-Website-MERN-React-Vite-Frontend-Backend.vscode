import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.database import SessionLocal
from app.models.question_bank import QuestionBank
from app.models.question_bank_purchase import QuestionBankPurchase
from app.models.question_bank_review import QuestionBankReview

def test_qb():
    db = SessionLocal()
    try:
        query = db.query(QuestionBank)
        qbs = query.order_by(QuestionBank.created_at.desc()).offset(0).limit(10).all()
        print(f"Found {len(qbs)} question banks")
        for qb in qbs:
            try:
                mcqs = qb.mcqs
                print(f"QB {qb.id} has {len(mcqs)} MCQs")
            except Exception as e:
                print(f"Error accessing MCQs for QB {qb.id}: {e}")
            
            student_count = db.query(QuestionBankPurchase).filter_by(question_bank_id=qb.id).count()
            reviews = db.query(QuestionBankReview).filter_by(question_bank_id=qb.id).all()
            review_count = len(reviews)
            average_rating = sum([r.rating for r in reviews]) / review_count if reviews else None
            print(f"QB {qb.id} student_count: {student_count}, review_count: {review_count}, avg_rating: {average_rating}")
            
        print("Test complete and successful")
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_qb()
