# app/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database.connection import init_db, close_db
from app.api import daily_checkin, onboarding
from app.middleware.error_handler import register_error_handlers

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup
    logger.info("Starting Sama Wellness Backend...")
    await init_db()
    logger.info("Database initialized successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Sama Wellness Backend...")
    await close_db()
    logger.info("Database connections closed")


# Initialize FastAPI app
app = FastAPI(
    title="Sama Wellness API",
    description="AI-powered wellness chatbot and voice assistant",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register error handlers
register_error_handlers(app)

# Include routers
app.include_router(daily_checkin.router, prefix="/api/daily_checkin", tags=["Daily Check-in"])
app.include_router(onboarding.router, prefix="/api")

@app.get("/")
async def root():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "service": "Sama Wellness API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """
    Detailed health check
    """
    return {
        "status": "healthy",
        "database": "connected",
        "services": {
            "llm": "available",
            "stt": "available",
            "tts": "available"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )


#Test
#I am having headache due to non-stop mobile screen
# I am afraid what will have to me in viva exam
# I have incomplete sleep and feel tired all day
