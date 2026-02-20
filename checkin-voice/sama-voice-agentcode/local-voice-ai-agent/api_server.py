"""
FastAPI server for checkin-voice service health monitoring and API endpoints.
This server runs alongside the voice chat application to provide health checks
and future API endpoints for the microservices architecture.
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

# Configure logging before other imports
import logging_config  # This configures loguru with standardized format
from loguru import logger
import base64
import assemblyai as aai
from langchain_google_genai import ChatGoogleGenerativeAI
import tempfile

from dependencies import get_current_user, get_optional_user, UserContext

load_dotenv(r"D:\Sama\.env")

app = FastAPI(
    title="Checkin Voice Service",
    description="Voice AI interaction service for SAMA wellness platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """
    Health check endpoint with database connectivity verification.
    Returns standardized health status for orchestration and monitoring.
    """
    from sqlalchemy import create_engine, text
    from sqlalchemy.exc import OperationalError
    
    # Check database connectivity
    db_status = "disconnected"
    overall_status = "unhealthy"
    
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        logger.warning("DATABASE_URL not configured")
        db_status = "disconnected"
        overall_status = "degraded"
    else:
        try:
            # Test database connection with a simple query
            engine = create_engine(database_url)
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
                db_status = "connected"
                overall_status = "healthy"
            engine.dispose()
        except OperationalError as e:
            logger.error(f"Database health check failed: {e}")
            db_status = "disconnected"
            overall_status = "unhealthy"
        except Exception as e:
            logger.error(f"Unexpected error during health check: {e}")
            db_status = "disconnected"
            overall_status = "unhealthy"
    
    return {
        "status": overall_status,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "service": "checkin-voice",
        "version": "1.0.0",
        "checks": {
            "database": db_status
        }
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "checkin-voice",
        "version": "1.0.0",
        "status": "running"
    }


class VoiceChatRequest(BaseModel):
    """Request model for voice chat"""
    audio: str  # Base64 encoded audio
    session_id: Optional[str] = None
    user_id: Optional[str] = None

class VoiceChatResponse(BaseModel):
    """Response model compatible with frontend"""
    success: bool
    data: dict

# Initialize services (lazy load or global)
aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY")
transcriber = aai.Transcriber()

chat_model = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

@app.post("/api/voice/chat", response_model=VoiceChatResponse)
async def voice_chat(
    request: VoiceChatRequest,
    user_context: UserContext = Depends(get_optional_user)
):
    """
    Process voice message: Audio -> STT -> LLM -> Response
    """
    user_id = user_context.user_id if user_context else request.user_id
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        # 1. Decode Audio
        try:
            # Handle data URI scheme if present
            audio_data = request.audio
            if "," in audio_data:
                audio_data = audio_data.split(",")[1]
            
            audio_bytes = base64.b64decode(audio_data)
        except Exception as e:
            logger.error(f"Audio decode error: {e}")
            raise HTTPException(status_code=400, detail="Invalid audio data")

        # 2. STT (AssemblyAI)
        # Write to temp file for AssemblyAI
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
            temp_audio.write(audio_bytes)
            temp_audio_path = temp_audio.name
        
        try:
            transcript = transcriber.transcribe(temp_audio_path)
            if transcript.status == aai.TranscriptStatus.error:
                 logger.error(f"AssemblyAI Error: {transcript.error}")
                 raise Exception(f"Transcript failed: {transcript.error}")
            text_input = transcript.text or ""
        finally:
             if os.path.exists(temp_audio_path):
                 os.unlink(temp_audio_path)

        logger.info(f"Transcript: {text_input}")

        if not text_input:
             return VoiceChatResponse(
                 success=True,
                 data={
                     "transcript": "",
                     "transcript_confidence": 0,
                     "reply_text": "I couldn't hear anything. Could you try again?",
                     "reply_audio_url": None,
                     "emotion": {"primary": "neutral", "intensity": 0},
                     "recommendations": [],
                     "is_crisis": False,
                     "meta": {"session_id": request.session_id or "new", "message_id": "voice-err"}
                 }
             )

        # 3. Call Checkin-Chat Service (The Brain)
        CHECKIN_CHAT_URL = os.getenv("CHECKIN_CHAT_URL", "http://localhost:8000")
        
        try:
            import requests
            chat_payload = {
                "user_id": user_id,
                "text": text_input,
                "session_id": request.session_id
            }
            
            # Call the chat service
            chat_response = requests.post(
                f"{CHECKIN_CHAT_URL}/api/daily_checkin/chat",
                json=chat_payload,
                timeout=30
            )
            
            if chat_response.status_code == 200:
                chat_data = chat_response.json()
                reply_text = chat_data.get("message", "")
                # Update session ID if provided by chat service
                if chat_data.get("session_id"):
                    request.session_id = chat_data.get("session_id")
            else:
                logger.error(f"Chat service returned {chat_response.status_code}: {chat_response.text}")
                reply_text = "I'm having trouble connecting to my thought process right now."
                
        except Exception as e:
            logger.error(f"Error calling chat service: {e}")
            reply_text = "I'm sorry, I encountered an error processing your request."
        
        # 4. Construct Response
        return VoiceChatResponse(
            success=True,
            data={
                "transcript": text_input,
                "transcript_confidence": 0.9, # Placeholder
                "reply_text": reply_text,
                "reply_audio_url": None, # TODO: Implement TTS and upload
                "emotion": {"primary": "neutral", "intensity": 5}, # Placeholder
                "recommendations": [],
                "is_crisis": False,
                "meta": {
                    "session_id": request.session_id or "generated-id", 
                    "message_id": f"msg-{datetime.now().timestamp()}"
                }
            }
        )

    except Exception as e:
        logger.exception(f"Voice processing critical error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class VoiceSessionRequest(BaseModel):
    """Request model for starting a voice session"""
    user_id: Optional[str] = None  # Optional: can be provided by API Gateway via headers
    session_type: str = "wellness_checkin"  # Type of voice session


class VoiceSessionResponse(BaseModel):
    """Response model for voice session"""
    session_id: str
    user_id: str
    status: str
    message: str


@app.post("/api/voice/session", response_model=VoiceSessionResponse)
async def start_voice_session(
    request: VoiceSessionRequest,
    user_context: UserContext = Depends(get_optional_user)
):
    """
    Start a voice interaction session.
    
    This is a placeholder endpoint that demonstrates the authentication pattern.
    Actual voice processing logic will be implemented in future tasks.
    
    Authentication:
    - When called through API Gateway: user_id extracted from X-User-Id header
    - When called directly: user_id must be provided in request body
    
    Args:
        request: Voice session request with optional user_id
        user_context: User context from API Gateway headers (optional)
    
    Returns:
        VoiceSessionResponse: Session information
    """
    # Extract user_id from headers (API Gateway) or request body (direct access)
    user_id = user_context.user_id if user_context else request.user_id
    
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="user_id must be provided either via X-User-Id header or in request body"
        )
    
    logger.info(f"Starting voice session for user {user_id}, type: {request.session_type}")
    
    # Generate session ID (placeholder)
    from uuid import uuid4
    session_id = str(uuid4())
    
    # TODO: Implement actual voice session initialization
    # This will include:
    # - Setting up STT/TTS pipelines
    # - Initializing conversation context
    # - Connecting to database for user preferences
    
    return VoiceSessionResponse(
        session_id=session_id,
        user_id=user_id,
        status="initialized",
        message="Voice session started successfully"
    )


@app.get("/api/voice/session/{session_id}")
async def get_voice_session(
    session_id: str,
    user_context: UserContext = Depends(get_optional_user)
):
    """
    Get voice session status.
    
    This is a placeholder endpoint that demonstrates the authentication pattern.
    
    Args:
        session_id: Voice session ID
        user_context: User context from API Gateway headers (optional)
    
    Returns:
        Session status information
    """
    logger.info(f"Getting voice session {session_id}")
    
    # TODO: Implement actual session retrieval logic
    
    return {
        "session_id": session_id,
        "status": "active",
        "user_id": user_context.user_id if user_context else "unknown"
    }


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", "8003"))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"Starting Checkin Voice API server on {host}:{port}")
    uvicorn.run(app, host=host, port=port)
