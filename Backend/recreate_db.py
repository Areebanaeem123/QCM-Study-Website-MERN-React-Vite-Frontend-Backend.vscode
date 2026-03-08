"""
Recreate database - drops all tables and creates them fresh
"""
from app.core.database import engine, Base
# Import all models to register them with Base
import app.models.user
import app.models.university
import app.models.subject
import app.models.lesson
import app.models.question_type
import app.models.mcq
import app.models.mcq_option
import app.models.mcq_approval
import app.models.pack
import app.models.pack_purchase
import app.models.pack_review
import app.models.mock_exam
import app.models.mock_exam_purchase
import app.models.mock_exam_review
import app.models.question_bank
import app.models.question_bank_purchase
import app.models.question_bank_review
import app.models.session
import app.models.page
import app.models.slider

print("🔄 Dropping all tables...")
Base.metadata.drop_all(bind=engine)
print("✅ All tables dropped!")

print("📝 Creating all tables...")
Base.metadata.create_all(bind=engine)
print("✅ Database tables created successfully!")
