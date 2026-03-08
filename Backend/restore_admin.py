import sqlalchemy as sa
from app.core.database import engine

def restore_admin():
    with engine.connect() as conn:
        try:
            # We'll update admin@example.com or any user that looks like the main admin
            result = conn.execute(sa.text("UPDATE users SET rank = 6 WHERE email = 'admin@example.com';"))
            conn.commit()
            print(f"Successfully restored admin rank.")
        except Exception as e:
            print(f"Error restoring admin: {e}")

if __name__ == "__main__":
    restore_admin()
