from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.core.security import get_password_hash
from datetime import datetime
import uuid

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Check if admin already exists
admin = db.query(User).filter(User.email == "admin@example.com").first()
if admin:
    print("Admin user already exists!")
else:
    # Create admin user
    new_admin = User(
        id=str(uuid.uuid4()),
        email="admin@example.com",
        password=get_password_hash("admin123456"),  # Change this password!
        first_name="Admin",
        last_name="User",
        rank=6,  # Admin rank
        civility="Mr",
        email_verified=datetime.now(),  # Set to datetime, not boolean
        is_robot_verified=False,
        accepted_terms=False,
        is_blocked=False
    )
    
    db.add(new_admin)
    db.commit()
    print("✅ Admin user created!")
    print("Email: admin@example.com")
    print("Password: admin123456")
    print("Rank: 6 (Admin)")

db.close()