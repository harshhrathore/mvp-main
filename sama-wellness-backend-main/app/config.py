# app/config.py

import os
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Any


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    
    # Application
    APP_NAME: str = "Sama Wellness"
    DEBUG: bool = False
    ALLOWED_ORIGINS: Any = ["*"]
    
    # Database (PostgreSQL/Supabase)
    # Format: postgresql+asyncpg://user:password@host:port/database?sslmode=require
    # Example: postgresql+asyncpg://postgres.project:[password]@aws-0-region.pooler.supabase.com:6543/postgres?sslmode=require
    DATABASE_URL: str
    DB_POOL_SIZE: int = 5  # Reduced for Supabase connection limits
    DB_MAX_OVERFLOW: int = 10  # Additional connections when pool is full
    
    # LLM Service
    GOOGLE_API_KEY: str = Field(..., description="Google API Key")
    LLM_API_URL: str  # Your hosted LLM endpoint
    LLM_API_KEY: str = ""
    LLM_MODEL_NAME: str = "sama-wellness-model"
    LLM_MAX_TOKENS: int = 500
    LLM_TEMPERATURE: float = 0.7
    
    # AssemblyAI (Speech-to-Text)
    ASSEMBLYAI_API_KEY: str
    
    # ElevenLabs (Text-to-Speech)
    ELEVENLABS_API_KEY: str
    ELEVENLABS_VOICE_ID: str = "default"  # Choose appropriate voice
    
    # File Storage
    UPLOAD_DIR: str = "/tmp/sama_uploads"
    AUDIO_STORAGE_URL: str = ""  # S3 or Cloud Storage URL
    MAX_AUDIO_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # Context Management
    MAX_CONVERSATION_HISTORY: int = 10  # Last N messages to include
    CONTEXT_SUMMARY_LENGTH: int = 200  # Characters
    
    # Security
    SECRET_KEY: str
    API_KEY_HEADER: str = "X-API-Key"

    model_config = SettingsConfigDict(
        env_file=".env" if os.getenv("RAILWAY_ENVIRONMENT") else "../.env",
        case_sensitive=True,
        extra="allow"
    )

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
settings = Settings()
