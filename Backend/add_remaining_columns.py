"""
Add remaining missing columns to question_banks table
"""
from sqlalchemy import text
from app.core.database import engine

def add_remaining_columns():
    with engine.begin() as connection:
        try:
            # Check if created_by column exists
            result = connection.execute(text("""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='question_banks' AND column_name='created_by'
                )
            """))
            created_by_exists = result.scalar()
            
            if not created_by_exists:
                print("Adding created_by column to question_banks table...")
                connection.execute(text("""
                    ALTER TABLE question_banks 
                    ADD COLUMN created_by VARCHAR NOT NULL DEFAULT 'system'
                """))
                print("✅ created_by column added successfully!")
            else:
                print("✓ created_by column already exists")
            
            # Check if creator_name column exists
            result = connection.execute(text("""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='question_banks' AND column_name='creator_name'
                )
            """))
            creator_name_exists = result.scalar()
            
            if not creator_name_exists:
                print("Adding creator_name column to question_banks table...")
                connection.execute(text("""
                    ALTER TABLE question_banks 
                    ADD COLUMN creator_name VARCHAR DEFAULT NULL
                """))
                print("✅ creator_name column added successfully!")
            else:
                print("✓ creator_name column already exists")
            
            # Check if updated_at column exists
            result = connection.execute(text("""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='question_banks' AND column_name='updated_at'
                )
            """))
            updated_at_exists = result.scalar()
            
            if not updated_at_exists:
                print("Adding updated_at column to question_banks table...")
                connection.execute(text("""
                    ALTER TABLE question_banks 
                    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                """))
                print("✅ updated_at column added successfully!")
            else:
                print("✓ updated_at column already exists")
                
            print("\n✅ All remaining columns have been added!")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            raise

if __name__ == "__main__":
    add_remaining_columns()
