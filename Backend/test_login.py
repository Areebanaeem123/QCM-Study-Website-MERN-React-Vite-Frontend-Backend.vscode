"""
Test script to verify admin user and authentication
"""
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password, get_password_hash
import uuid

db = SessionLocal()

print("=" * 60)
print("CHECKING ADMIN USER IN DATABASE")
print("=" * 60)

# Check for admin user
admin = db.query(User).filter(User.email == "admin@example.com").first()

if admin:
    print(f"✅ Admin user found!")
    print(f"   Email: {admin.email}")
    print(f"   Rank: {admin.rank}")
    print(f"   Password hash: {admin.password[:30]}...")
    
    # Test password verification
    test_password = "admin123456"
    is_valid = verify_password(test_password, admin.password)
    print(f"   Password verification for '{test_password}': {is_valid}")
    
    if not is_valid:
        print("\n⚠️ Password mismatch! Updating admin password...")
        admin.password = get_password_hash(test_password)
        db.commit()
        print("✅ Password updated successfully!")
else:
    print("❌ Admin user NOT found!")
    print("\nCreating admin user...")
    
    new_admin = User(
        id=str(uuid.uuid4()),
        email="admin@example.com",
        password=get_password_hash("admin123456"),
        first_name="Admin",
        last_name="User",
        rank=6,  # Admin rank
        civility="Mr",
        email_verified=True
    )
    
    db.add(new_admin)
    db.commit()
    print("✅ Admin user created!")
    print(f"   Email: admin@example.com")
    print(f"   Password: admin123456")
    print(f"   Rank: 6 (Admin)")

print("\n" + "=" * 60)
print("ALL USERS IN DATABASE")
print("=" * 60)

users = db.query(User).all()
for user in users:
    print(f"Email: {user.email}, Rank: {user.rank}, Name: {user.first_name} {user.last_name}")

db.close()
