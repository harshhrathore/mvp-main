# app/services/database_service.py

from sqlalchemy import select, desc, and_, func
from datetime import date, datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.user_preferences import UserPreferences
from app.models.dosha_tracking import DoshaTracking
from app.models.dosha_assessment import DoshaAssessment
from app.models.conversation_session import ConversationSession
from app.models.chat_message import ConversationMessage
import uuid


async def get_user_profile(db: AsyncSession, user_id: str) -> User:
    """
    Fetch user profile from database (using UUID)
    """
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    return result.scalars().first()


async def get_user_preferences(db: AsyncSession, user_id: str) -> UserPreferences:
    """
    Fetch user preferences from database (using UUID)
    """
    result = await db.execute(
        select(UserPreferences).where(UserPreferences.user_id == user_id)
    )
    return result.scalars().first()


async def get_user_dosha_type_from_preferences(db: AsyncSession, user_id: str) -> str:
    """
    Fetch the user's latest dosha assessment result
    """
    result = await db.execute(
        select(DoshaAssessment)
        .where(DoshaAssessment.user_id == user_id)
        .order_by(DoshaAssessment.completed_at.desc())
    )
    assessment = result.scalars().first()
    if assessment:
        return assessment.primary_dosha
    return "vata"  # Default


async def get_latest_dosha(db: AsyncSession, user_id: str) -> tuple:
    """
    Fetch latest dosha tracking information for user (using new schema)
    """
    result = await db.execute(
        select(DoshaTracking)
        .where(DoshaTracking.user_id == user_id)
        .order_by(DoshaTracking.created_at.desc())
    )
    dosha = result.scalars().first()
    
    if dosha:
        return (dosha, dosha.dominant_imbalance or "vata")
    
    return (None, None)


async def create_conversation_session(
    db: AsyncSession,
    user_id: str,
    session_type: str = 'checkin'
) -> ConversationSession:
    """
    Create a new conversation session
    """
    session = ConversationSession(
        user_id=user_id,
        session_type=session_type
    )
    
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    return session


async def get_conversation_session(
    db: AsyncSession,
    session_id: str,
    user_id: str
) -> ConversationSession:
    """
    Get existing conversation session
    """
    result = await db.execute(
        select(ConversationSession)
        .where(
            and_(
                ConversationSession.session_id == session_id,
                ConversationSession.user_id == user_id
            )
        )
    )
    return result.scalars().first()


async def save_conversation_message(
    db: AsyncSession,
    session_id: str,
    user_id: str,
    sequence_number: int,
    transcript_text: str = None,
    ai_response_text: str = None,
    input_type: str = 'text'
) -> ConversationMessage:
    """
    Save conversation message to database (supports both user input and AI response)
    """
    message = ConversationMessage(
        session_id=session_id,
        user_id=user_id,
        sequence_number=sequence_number,
        transcript_text=transcript_text,
        ai_response_text=ai_response_text,
        input_type=input_type if transcript_text else None
    )
    
    db.add(message)
    await db.commit()
    await db.refresh(message)
    
    return message


async def get_session_messages(
    db: AsyncSession,
    session_id: str
) -> list[ConversationMessage]:
    """
    Fetch all messages for a specific conversation session
    """
    result = await db.execute(
        select(ConversationMessage)
        .where(ConversationMessage.session_id == session_id)
        .order_by(ConversationMessage.sequence_number)
    )
    return result.scalars().all()


async def get_conversation_history(
    db: AsyncSession,
    user_id: str,
    limit: int = 10
) -> list[ConversationMessage]:
    """
    Fetch recent conversation history for a user across all sessions
    """
    result = await db.execute(
        select(ConversationMessage)
        .where(ConversationMessage.user_id == user_id)
        .order_by(desc(ConversationMessage.created_at))
        .limit(limit)
    )
    messages = result.scalars().all()
    return list(reversed(messages))


async def get_recent_messages_last_two_days(
    db: AsyncSession,
    user_id: str
) -> list[ConversationMessage]:
    """
    Fetch ALL messages from the past 2 days across all sessions.
    """
    start_ts = datetime.utcnow() - timedelta(days=2)
    result = await db.execute(
        select(ConversationMessage)
        .where(ConversationMessage.user_id == user_id)
        .where(ConversationMessage.created_at >= start_ts)
        .order_by(ConversationMessage.created_at)
    )
    return result.scalars().all()


async def get_prakriti_bikriti_and_history(
    db: AsyncSession,
    user_id: str
) -> dict:
    """
    Returns prakriti (from latest assessment), bikriti (latest dosha tracking),
    and dosha history for today and yesterday.
    """
    # Prakriti from latest assessment
    prakriti = await get_user_dosha_type_from_preferences(db, user_id)

    # Bikriti = latest dosha tracking
    latest_dosha, latest_name = await get_latest_dosha(db, user_id)
    bikriti = None
    if latest_dosha and latest_name:
        bikriti = {
            "dosha": latest_name,
            "intensity": latest_dosha.imbalance_intensity,
            "updated_at": latest_dosha.created_at
        }

    today = date.today()
    yesterday = today - timedelta(days=1)

    # Fetch today's + yesterday's dosha history
    result = await db.execute(
        select(DoshaTracking)
        .where(DoshaTracking.user_id == user_id)
        .where(DoshaTracking.date >= yesterday)
        .order_by(DoshaTracking.created_at.desc())
    )
    history_rows = result.scalars().all()

    history = {"today": None, "yesterday": None}
    for row in history_rows:
        row_date = row.date
        if row_date == today and history["today"] is None:
            history["today"] = {
                "dosha": row.dominant_imbalance or "vata",
                "intensity": row.imbalance_intensity,
                "updated_at": row.created_at
            }
        elif row_date == yesterday and history["yesterday"] is None:
            history["yesterday"] = {
                "dosha": row.dominant_imbalance or "vata",
                "intensity": row.imbalance_intensity,
                "updated_at": row.created_at
            }
        
        if history["today"] and history["yesterday"]:
            break

    return {
        "prakriti": prakriti,
        "bikriti": bikriti,
        "history": history
    }

from app.models.ayurveda_knowledge import AyurvedaKnowledge

async def get_relevant_knowledge(
    db: AsyncSession,
    user_text: str,
    limit: int = 3
) -> list[AyurvedaKnowledge]:
    """
    Fetch relevant Ayurvedic knowledge based on keywords in user text.
    Currently using simple ILIKE search on title and description.
    """
    # Extract significant words (very simple keyword extraction)
    words = [w for w in user_text.lower().split() if len(w) > 4]
    
    if not words:
        return []

    # Build OR conditions
    conditions = []
    for word in words:
        term = f"%{word}%"
        conditions.append(AyurvedaKnowledge.title.ilike(term))
        conditions.append(AyurvedaKnowledge.description_short.ilike(term))
        # conditions.append(AyurvedaKnowledge.helps_with_emotions.cast(Text).ilike(term)) # If needed

    if not conditions:
        return []

    from sqlalchemy import or_
    
    result = await db.execute(
        select(AyurvedaKnowledge)
        .where(or_(*conditions))
        .limit(limit)
    )
    
    return result.scalars().all()