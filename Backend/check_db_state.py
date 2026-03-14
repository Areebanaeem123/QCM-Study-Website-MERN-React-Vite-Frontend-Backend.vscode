
import sys
import os
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.user import User
from app.models.pack import Pack
from app.models.pack_purchase import PackPurchase
from app.models.question_bank import QuestionBank
from app.models.question_bank_purchase import QuestionBankPurchase

def debug():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Total Users: {len(users)}")
        for u in users:
            print(f" - User: {u.email}, Rank: {u.rank}, ID: {u.id}")

        packs = db.query(Pack).all()
        print(f"\nTotal Packs: {len(packs)}")
        for p in packs:
            print(f" - Pack: {p.title}, Published: {p.is_published}, ID: {p.id}")

        purchases = db.query(PackPurchase).all()
        print(f"\nTotal Pack Purchases: {len(purchases)}")
        for pp in purchases:
            print(f" - Purchase: Student ID {pp.student_id}, Pack ID {pp.pack_id}")

        qbs = db.query(QuestionBank).all()
        print(f"\nTotal Question Banks: {len(qbs)}")

        qb_purchases = db.query(QuestionBankPurchase).all()
        print(f"\nTotal QB Purchases: {len(qb_purchases)}")

    finally:
        db.close()

if __name__ == "__main__":
    # Add the current directory to sys.path to import app
    sys.path.append(os.getcwd())
    debug()
