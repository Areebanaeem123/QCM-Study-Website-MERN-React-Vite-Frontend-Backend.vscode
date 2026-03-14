from app.core.database import SessionLocal
from app.models.user import User
from app.api.v1.endpoints.dashboard import get_student_dashboard_stats
import asyncio
import json

async def verify_user(email):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"User {email} not found")
        return
    
    print(f"\n--- Verifying stats for: {email} (Rank: {user.rank}) ---")
    stats = await get_student_dashboard_stats(db=db, current_user=user)
    stats_dict = json.loads(stats.model_dump_json())
    
    print(f"Purchased items count: {len(stats_dict['purchased_packs'])}")
    for p in stats_dict['purchased_packs']:
        subjects = [s['name'] for s in p.get('subjects', [])]
        print(f"  - {p['name']} (Type: {p['type']}) | Subjects: {', '.join(subjects)}")
    
    db.close()

async def main():
    await verify_user('mustafa.zafar@nu.edu.pk')
    await verify_user('admin@example.com')

if __name__ == "__main__":
    asyncio.run(main())
