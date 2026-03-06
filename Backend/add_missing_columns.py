"""
Add missing columns to question_banks table
This script adds the price and currency columns that are defined in the model
but missing from the database.
"""
from sqlalchemy import Column, String, Float, text
from app.core.database import engine

def add_missing_columns():
    with engine.begin() as connection:
        try:
            # Check if price column exists
            result = connection.execute(text("""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='question_banks' AND column_name='price'
                )
            """))
            price_exists = result.scalar()
            
            if not price_exists:
                print("Adding price column to question_banks table...")
                connection.execute(text("""
                    ALTER TABLE question_banks 
                    ADD COLUMN price FLOAT NOT NULL DEFAULT 0.0
                """))
                print("✅ Price column added successfully!")
            else:
                print("✓ Price column already exists")
            
            # Check if currency column exists
            result = connection.execute(text("""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='question_banks' AND column_name='currency'
                )
            """))
            currency_exists = result.scalar()
            
            if not currency_exists:
                print("Adding currency column to question_banks table...")
                connection.execute(text("""
                    ALTER TABLE question_banks 
                    ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT 'CHF'
                """))
                print("✅ Currency column added successfully!")
            else:
                print("✓ Currency column already exists")
                
            print("\n✅ All missing columns have been added!")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            raise

if __name__ == "__main__":
    add_missing_columns()
