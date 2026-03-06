"""
Add gifted column to question_bank_purchases table
This script adds the gifted column that is defined in the model
but missing from the database.
"""
from sqlalchemy import text
from app.core.database import engine

def add_gifted_column():
    with engine.begin() as connection:
        try:
            # Check if gifted column exists
            result = connection.execute(text("""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='question_bank_purchases' AND column_name='gifted'
                )
            """))
            gifted_exists = result.scalar()
            
            if not gifted_exists:
                print("Adding gifted column to question_bank_purchases table...")
                connection.execute(text("""
                    ALTER TABLE question_bank_purchases 
                    ADD COLUMN gifted BOOLEAN NOT NULL DEFAULT FALSE
                """))
                print("✅ Gifted column added successfully!")
            else:
                print("✓ Gifted column already exists")
                
            print("\n✅ Migration completed!")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            raise

if __name__ == "__main__":
    add_gifted_column()
