from app.core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    r = conn.execute(text(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='sliders')"
    ))
    print('sliders table exists:', r.scalar())

    r2 = conn.execute(text("SELECT * FROM sliders LIMIT 5"))
    rows = r2.fetchall()
    print('rows:', rows)
