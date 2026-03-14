from app.core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_name='mock_exams' ORDER BY column_name"
    ))
    cols = [r[0] for r in result]
    print("Columns in mock_exams:", cols)
    print("image_url present:", "image_url" in cols)
