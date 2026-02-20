# test_database_setup.py
"""
Test script to verify that all models can be imported and database can be initialized
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import init_db, close_db, engine
from app.models import *

async def test_database_setup():
    """Test database initialization and model imports"""
    try:
        print("Testing database setup...")
        
        # Test model imports
        print("✓ All models imported successfully")
        
        # Test database initialization
        await init_db()
        print("✓ Database tables created successfully")
        
        # Test basic operations (optional)
        print("✓ Database connection working")
        
        print("\n🎉 All tests passed! Database is ready for SQLite usage.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    finally:
        await close_db()

if __name__ == "__main__":
    asyncio.run(test_database_setup())