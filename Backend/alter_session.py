import sqlalchemy as sa
from app.core.database import engine

def alter_table():
    with engine.connect() as conn:
        try:
            conn.execute(sa.text("ALTER TABLE session_items ADD COLUMN question_bank_id VARCHAR;"))
            conn.execute(sa.text("ALTER TABLE session_items ADD CONSTRAINT fk_session_items_qb FOREIGN KEY (question_bank_id) REFERENCES question_banks(id) ON DELETE CASCADE;"))
            conn.commit()
            print("Successfully added question_bank_id column to session_items")
        except Exception as e:
            print(f"Error altering table: {e}")

if __name__ == "__main__":
    alter_table()
