import sqlalchemy as sa
from app.core.database import engine

def alter_table():
    with engine.connect() as conn:
        try:
            conn.execute(sa.text("ALTER TABLE users ADD COLUMN academic_year VARCHAR;"))
            conn.execute(sa.text("ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITHOUT TIME ZONE;"))
            conn.commit()
            print("Successfully added academic_year and last_login columns to users")
        except Exception as e:
            print(f"Error altering table: {e}")

if __name__ == "__main__":
    alter_table()
