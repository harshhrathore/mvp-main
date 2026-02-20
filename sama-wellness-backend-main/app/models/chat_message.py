from sqlalchemy import Column, String, Integer, ForeignKey, Text, CheckConstraint, DECIMAL
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database.connection import Base


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"
    
    message_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("conversation_sessions.session_id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    sequence_number = Column(Integer, nullable=False)
    
    # User's message
    input_type = Column(String(10))  # 'voice' or 'text'
    audio_file_url = Column(Text)
    audio_duration_seconds = Column(Integer)
    transcript_text = Column(Text)
    transcript_confidence = Column(DECIMAL(3,2))
    
    # AI's response
    ai_response_text = Column(Text)
    ai_response_audio_url = Column(Text)
    response_emotion_tone = Column(String(20))
    background_sound = Column(String(50))
    
    # Context
    time_of_day = Column(String(20))
    detected_context = Column(String(50))
    previous_topic = Column(String(100))
    
    created_at = Column(TIMESTAMP, default=func.now(), index=True)
    
    __table_args__ = (
        CheckConstraint(
            "input_type IN ('voice', 'text')",
            name='chk_input_type'
        ),
    )
