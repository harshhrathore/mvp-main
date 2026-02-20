# app/database/connection.py

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
import logging
import os

from app.config import settings

logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = settings.DATABASE_URL
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")

# Ensure asyncpg driver is used
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

logger.info("Using configured database URL")

# Create async engine for PostgreSQL (Supabase)
engine = create_async_engine(
    DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    # Disable prepared statements for Supabase Transaction Pooler compatibility
    connect_args={"statement_cache_size": 0}
)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
Base = declarative_base()


async def init_db():
    """
    Initialize database - create tables if they don't exist
    """
    try:
        async with engine.begin() as conn:
            # Import all models here to ensure they're registered
            from app.models import (
                user,
                user_authentication,
                user_onboarding,
                user_preferences,
                dosha_types,
                dosha_assessment,
                dosha_tracking,
                conversation_session,
                chat_message,
                emotion_analysis,
                user_progress_daily,
                ayurveda_knowledge,
                knowledge_tags,
                safety_monitoring,
                helpline_referrals,
                recommendation_history,
                user_insights_weekly,
                user_streaks,
                app_configuration,
                error_logs,
                api_usage_metrics,
                push_subscriptions
            )
            
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
            
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise


async def close_db():
    """
    Close database connections
    """
    await engine.dispose()
    logger.info("Database connections closed")


async def get_db():
    """
    Dependency to get database session
    Use this in FastAPI endpoints with Depends(get_db)
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
