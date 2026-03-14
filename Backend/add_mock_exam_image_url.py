"""
Migration: Add missing image_url column to mock_exams table.
"""
from app.core.database import engine
from sqlalchemy import text

def column_exists(conn, table, column):
    result = conn.execute(text(
        "SELECT COUNT(*) FROM information_schema.columns "
        "WHERE table_name = :table AND column_name = :column"
    ), {"table": table, "column": column})
    return result.scalar() > 0

with engine.begin() as conn:
    if not column_exists(conn, "mock_exams", "image_url"):
        print("Adding image_url column to mock_exams...")
        conn.execute(text("ALTER TABLE mock_exams ADD COLUMN image_url VARCHAR;"))
        print("Done! image_url column added to mock_exams.")
    else:
        print("image_url column already exists on mock_exams. No changes made.")
