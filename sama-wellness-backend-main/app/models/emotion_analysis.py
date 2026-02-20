# app/models/emotion_analysis.py

from sqlalchemy import Column, String, Integer, DECIMAL, ForeignKey, TIMESTAMP, CheckConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func
import uuid
from app.database.connection import Base


class EmotionAnalysis(Base):
    """
    Matches the real schema.sql emotion_analysis table exactly.
    Node.js emotionAnalysisService.ts also writes to this same table.
    """
    __tablename__ = "emotion_analysis"

    analysis_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("conversation_messages.message_id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # BERT 28 emotion results
    primary_emotion = Column(String(50), nullable=False)
    primary_confidence = Column(DECIMAL(3, 2), nullable=False)
    all_emotions = Column(JSONB, nullable=False)   # All 28 emotions with probabilities
    emotion_intensity = Column(Integer)

    # Ayurvedic mapping
    vata_impact_score = Column(DECIMAL(3, 2))
    pitta_impact_score = Column(DECIMAL(3, 2))
    kapha_impact_score = Column(DECIMAL(3, 2))
    recommended_dosha_focus = Column(String(10))

    # Model metadata
    bert_model_version = Column(String(20))
    processing_time_ms = Column(Integer)
    analysis_timestamp = Column(TIMESTAMP, default=func.now(), index=True)

    __table_args__ = (
        CheckConstraint('emotion_intensity >= 1 AND emotion_intensity <= 10', name='chk_emotion_intensity'),
    )