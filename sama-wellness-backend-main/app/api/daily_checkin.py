# app/api/daily_checkin.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from datetime import datetime
import logging
import uuid
from .llm import get_llm_response

from app.database.connection import get_db
from app.services.database_service import (
    get_user_profile,
    get_user_preferences,
    get_user_dosha_type_from_preferences,
    get_conversation_history,
    create_conversation_session,
    get_conversation_session,
    save_conversation_message,
    get_session_messages,
    get_recent_messages_last_two_days,
    get_prakriti_bikriti_and_history,
    get_relevant_knowledge
)
from app.services.prompt_builder import build_checkin_prompt
from app.services.emotion_service import get_emotion_service

logger = logging.getLogger(__name__)
router = APIRouter()


# Request/Response Models
class DailyCheckinRequest(BaseModel):
    """Request model for daily check-in"""
    user_id: str  # Now UUID string
    text: str
    session_id: str = None  # Optional: for continuing a conversation


class CheckinResponse(BaseModel):
    """Response model for check-in"""
    message: str
    user_id: str
    session_id: str
    timestamp: datetime


@router.post("/chat", response_model=CheckinResponse)
async def daily_checkin(
    request: DailyCheckinRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Process daily check-in conversation with personalized response using Supabase schema
    
    Flow:
    1. Validate request
    2. Fetch user profile from DB (UUID-based)
    3. Get or create conversation session
    4. Fetch conversation history for this session
    5. Analyze emotion from user text (BERT)
    6. Fetch relevant Ayurveda knowledge (RAG)
    7. Build personalized prompt with context
    8. Call LLM for AI response
    9. Save both user message and AI response + emotion analysis
    10. Return response with session_id
    """
    
    logger.info(f"Processing daily check-in for user {request.user_id}")
    
    # Step 1: Validate request
    if not request.user_id or not request.text:
        raise HTTPException(status_code=400, detail="user_id and text are required")
    
    # Step 2: Fetch user data from database
    user = await get_user_profile(db, request.user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User {request.user_id} not found")
    
    logger.info(f"Found user profile: {user.full_name}")
    
    # Fetch user preferences and dosha info
    preferences = await get_user_preferences(db, request.user_id)
    dosha_type_name = await get_user_dosha_type_from_preferences(db, request.user_id)
    
    logger.info(f"Fetched preferences and dosha for user {request.user_id}")
    
    # Step 3: Get or create conversation session
    session = None
    if request.session_id:
        # Try to find existing session
        session = await get_conversation_session(db, request.session_id, request.user_id)
        if not session:
            raise HTTPException(status_code=404, detail=f"Session {request.session_id} not found for user")
    else:
        # Create new session
        session = await create_conversation_session(db, request.user_id, 'checkin')
    
    session_id = str(session.session_id)
    logger.info(f"Using session {session_id}")
    
    # Step 4: Fetch conversation history for this session
    conversation_history = await get_session_messages(db, session_id)
    logger.info(f"Session {session_id} has {len(conversation_history)} messages")
    
    # Step 5: Analyze emotion using BERT
    emotion_service = get_emotion_service()
    emotion_analysis = emotion_service.analyze_emotion(request.text)
    logger.info(f"Emotion analysis: {emotion_analysis['primary_emotion']} → {emotion_analysis['dosha']} dosha")

    # Fetch recent messages across all sessions for broader context
    recent_messages = await get_recent_messages_last_two_days(db, request.user_id)
    logger.info(f"Fetched {len(recent_messages)} messages from last 2 days for user {request.user_id}")

    # Fetch dosha context (prakriti + bikriti + yesterday/today history)
    dosha_context = await get_prakriti_bikriti_and_history(db, request.user_id)
    
    # Step 6: Fetch relevant Ayurveda knowledge (RAG)
    relevant_knowledge = await get_relevant_knowledge(db, request.text)
    logger.info(f"Found {len(relevant_knowledge)} relevant knowledge items")

    # Step 7: Build personalized prompt with context
    personalized_prompt = build_checkin_prompt(
        user=user,
        preferences=preferences,
        dosha_type_name=dosha_type_name,
        user_text=request.text,
        conversation_history=conversation_history,
        recent_messages=recent_messages,
        dosha_context=dosha_context,
        knowledge_context=relevant_knowledge
    )
    
    logger.info(f"Built personalized prompt for user {request.user_id}")
    logger.info(f"=== PROMPT BEING SENT TO LLM ===\n{personalized_prompt}\n=== END PROMPT ===")
    
    # Step 8: Call LLM
    response_text = await get_llm_response(
        messages=[{"role": "user", "content": personalized_prompt}]
    )
    
    logger.info(f"Received LLM response for user {request.user_id}")
    
    # Step 9: Save messages to database
    try:
        # Calculate sequence numbers
        next_sequence = len(conversation_history) + 1

        # Save user message — returns the saved message with its message_id
        user_msg = await save_conversation_message(
            db=db,
            session_id=session_id,
            user_id=request.user_id,
            sequence_number=next_sequence,
            transcript_text=request.text,
            input_type='text'
        )

        # Save AI response message
        await save_conversation_message(
            db=db,
            session_id=session_id,
            user_id=request.user_id,
            sequence_number=next_sequence + 1,
            ai_response_text=response_text
        )

        # Save emotion analysis — must use message_id (NOT NULL FK in schema)
        from app.models.emotion_analysis import EmotionAnalysis

        # Map emotion_service output to real schema column names
        all_emotions_data = emotion_analysis.get('all_emotions', {})
        if isinstance(all_emotions_data, list):
            # Convert list to dict if needed
            all_emotions_data = {e: 0.0 for e in all_emotions_data} if all_emotions_data else {}

        emotion_record = EmotionAnalysis(
            message_id=user_msg.message_id,          # Required NOT NULL FK
            user_id=request.user_id,
            primary_emotion=emotion_analysis['primary_emotion'],
            primary_confidence=emotion_analysis.get('emotion_confidence', 0.0),
            all_emotions=all_emotions_data,           # JSONB, NOT NULL
            emotion_intensity=None,                   # Optional
            recommended_dosha_focus=emotion_analysis.get('dosha'),
            bert_model_version='bert-v1',
            processing_time_ms=0
        )
        db.add(emotion_record)
        await db.commit()

        logger.info(f"Saved emotion analysis to database (message_id={user_msg.message_id})")
        logger.info(f"Saved conversation messages for user {request.user_id}")
    except Exception as e:
        logger.error(f"Error saving conversation messages: {e}")
        raise HTTPException(status_code=500, detail="Failed to save conversation")
    
    # Step 10: Return response
    return CheckinResponse(
        message=response_text,
        user_id=request.user_id,
        session_id=session_id,
        timestamp=datetime.now()
    )


class ConversationMessage(BaseModel):
    """Individual message in conversation"""
    message_type: str  # 'user' or 'ai'
    content: str
    created_at: datetime


class ConversationHistoryResponse(BaseModel):
    """Response model for conversation history"""
    user_id: str
    session_id: str = None
    messages: list[ConversationMessage]
    total_messages: int


@router.get("/history/{user_id}", response_model=ConversationHistoryResponse)
async def get_chat_history(
    user_id: str,
    session_id: str = None,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve conversation history for a user
    
    Args:
        user_id: User ID (UUID)
        session_id: Optional session ID to get specific session history
        limit: Number of recent messages to retrieve (default: 20)
    
    Returns:
        List of messages with type (user/ai) and content
    """
    logger.info(f"Fetching conversation history for user {user_id}")
    
    # Verify user exists
    user = await get_user_profile(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    
    # Fetch conversation history
    if session_id:
        messages = await get_session_messages(db, session_id)
    else:
        messages = await get_conversation_history(db, user_id, limit=limit)
    
    # Format response
    formatted_messages = []
    for msg in messages:
        if msg.transcript_text:
            # User message
            formatted_messages.append(ConversationMessage(
                message_type='user',
                content=msg.transcript_text,
                created_at=msg.created_at
            ))
        if msg.ai_response_text:
            # AI message
            formatted_messages.append(ConversationMessage(
                message_type='ai',
                content=msg.ai_response_text,
                created_at=msg.created_at
            ))
    
    logger.info(f"Retrieved {len(formatted_messages)} messages for user {user_id}")
    
    return ConversationHistoryResponse(
        user_id=user_id,
        session_id=session_id,
        messages=formatted_messages,
        total_messages=len(formatted_messages)
    )
