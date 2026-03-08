import sys
import os
import sqlalchemy.exc
from app.core.database import SessionLocal
from app.models.user import User
from app.models.mcq import MCQ

db = SessionLocal()
mcq_id = "def02306-beab-471d-b8f1-38184a42e7cb"
mcq = db.query(MCQ).filter(MCQ.id == mcq_id).first()

if mcq:
    print(f"Found MCQ: {mcq.title}")
    try:
        db.delete(mcq)
        db.commit()
        print("Success")
    except Exception as e:
        print(f"Failure: {e}")
else:
    print(f"MCQ {mcq_id} not found")

