"""
Quick setup verification script for Supabase database connection
Run this after configuring your .env file to verify everything works
"""

import asyncio
import sys
from sqlalchemy import text

async def verify_setup():
    """Verify database connection and setup"""
    
    print("🔍 Verifying Supabase PostgreSQL setup...\n")
    
    try:
        # Import after printing to show progress
        from app.config import settings
        from app.database.connection import engine, init_db
        
        # Step 1: Check environment variables
        print("1️⃣ Checking environment variables...")
        if not settings.DATABASE_URL:
            print("   ❌ DATABASE_URL not set in .env")
            return False
        
        if "postgresql" not in settings.DATABASE_URL:
            print("   ⚠️  DATABASE_URL doesn't appear to be PostgreSQL")
            print(f"   Current: {settings.DATABASE_URL[:50]}...")
            return False
        
        if "[YOUR-PASSWORD]" in settings.DATABASE_URL:
            print("   ❌ Please replace [YOUR-PASSWORD] in .env with your actual Supabase password")
            return False
            
        print("   ✅ Environment variables configured")
        
        # Step 2: Test database connection
        print("\n2️⃣ Testing database connection...")
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"   ✅ Connected to PostgreSQL")
            print(f"   Version: {version[:50]}...")
        
        # Step 3: Initialize database schema
        print("\n3️⃣ Initializing database schema...")
        await init_db()
        print("   ✅ Database tables created successfully")
        
        # Step 4: Verify tables exist
        print("\n4️⃣ Verifying tables...")
        async with engine.connect() as conn:
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name
            """))
            tables = [row[0] for row in result]
            
            expected_tables = ['users', 'user_preferences', 'dosha_tracking', 
                             'checkin_sessions', 'chat_messages']
            
            for table in expected_tables:
                if table in tables:
                    print(f"   ✅ Table '{table}' exists")
                else:
                    print(f"   ⚠️  Table '{table}' not found")
        
        print("\n" + "="*60)
        print("🎉 Setup verification completed successfully!")
        print("="*60)
        print("\nYou can now start the server with:")
        print("   uvicorn app.main:app --reload")
        print("\nOr deploy to production.")
        print("="*60)
        
        return True
        
    except ImportError as e:
        print(f"\n❌ Import error: {e}")
        print("\nMake sure you've installed all dependencies:")
        print("   pip install -r requirements.txt")
        return False
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nTroubleshooting:")
        print("1. Check your DATABASE_URL in .env")
        print("2. Verify your Supabase password is correct")
        print("3. Ensure your IP is allowed in Supabase settings")
        print("4. Check if SSL is required: ?sslmode=require")
        print("\nSee SUPABASE_SETUP.md for detailed instructions")
        return False
    
    finally:
        # Clean up
        try:
            await engine.dispose()
        except:
            pass


def main():
    """Main entry point"""
    success = asyncio.run(verify_setup())
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
