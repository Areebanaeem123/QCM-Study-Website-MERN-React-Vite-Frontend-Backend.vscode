
import sys
import os
from sqlalchemy import create_engine, text

# Add the parent directory to sys.path to import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

def migrate():
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        print("Migrating database...")
        
        # 1. Update quiz_attempts.correct_answers to Float
        try:
            conn.execute(text("ALTER TABLE quiz_attempts ALTER COLUMN correct_answers TYPE FLOAT;"))
            print("Successfully updated quiz_attempts.correct_answers to FLOAT")
        except Exception as e:
            print(f"Error updating quiz_attempts: {e}")

        # 2. Add selected_option_ids to quiz_responses
        try:
            conn.execute(text("ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS selected_option_ids TEXT;"))
            print("Successfully added selected_option_ids to quiz_responses")
        except Exception as e:
            print(f"Error adding column to quiz_responses: {e}")
            
        conn.commit()
        print("Migration complete.")

if __name__ == "__main__":
    migrate()
