"""
Add missing datetime columns to question_banks table
"""
from sqlalchemy import text
from app.core.database import engine

def add_missing_datetime_columns():
    with engine.begin() as connection:
        try:
            # Check if start_datetime column exists
            result = connection.execute(text("""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='question_banks' AND column_name='start_datetime'
                )
            """))
            start_datetime_exists = result.scalar()
            
            if not start_datetime_exists:
                print("Adding start_datetime column to question_banks table...")
                connection.execute(text("""
                    ALTER TABLE question_banks 
                    ADD COLUMN start_datetime TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
                """))
                print("✅ start_datetime column added successfully!")
            else:
                print("✓ start_datetime column already exists")
            
            # Check if expiry_datetime column exists
            result = connection.execute(text("""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='question_banks' AND column_name='expiry_datetime'
                )
            """))
            expiry_datetime_exists = result.scalar()
            
            if not expiry_datetime_exists:
                print("Adding expiry_datetime column to question_banks table...")
                connection.execute(text("""
                    ALTER TABLE question_banks 
                    ADD COLUMN expiry_datetime TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
                """))
                print("✅ expiry_datetime column added successfully!")
            else:
                print("✓ expiry_datetime column already exists")
            
            # Check if display_before_start column exists
            result = connection.execute(text("""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='question_banks' AND column_name='display_before_start'
                )
            """))
            display_before_start_exists = result.scalar()
            
            if not display_before_start_exists:
                print("Adding display_before_start column to question_banks table...")
                connection.execute(text("""
                    ALTER TABLE question_banks 
                    ADD COLUMN display_before_start BOOLEAN DEFAULT FALSE
                """))
                print("✅ display_before_start column added successfully!")
            else:
                print("✓ display_before_start column already exists")
            
            # Check if is_published column exists
            result = connection.execute(text("""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='question_banks' AND column_name='is_published'
                )
            """))
            is_published_exists = result.scalar()
            
            if not is_published_exists:
                print("Adding is_published column to question_banks table...")
                connection.execute(text("""
                    ALTER TABLE question_banks 
                    ADD COLUMN is_published BOOLEAN DEFAULT FALSE
                """))
                print("✅ is_published column added successfully!")
            else:
                print("✓ is_published column already exists")
                
            print("\n✅ All missing columns have been added!")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            raise

if __name__ == "__main__":
    add_missing_datetime_columns()
