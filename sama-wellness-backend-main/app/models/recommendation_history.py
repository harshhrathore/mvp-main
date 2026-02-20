# app/models/recommendation_history.py

from sqlalchemy import Column, String, Boolean, TIMESTAMP, ForeignKey, CheckConstraint, Integer, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func
import uuid
from app.database.connection import Base


class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"

    recommendation_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id = Column(String, ForeignKey("conversation_sessions.session_id", ondelete="SET NULL"))
    knowledge_id = Column(String, ForeignKey("ayurveda_knowledge.knowledge_id", ondelete="CASCADE"))
    
    # Recommendation context
    recommended_at = Column(TIMESTAMP, default=func.now(), index=True)
    reason = Column(JSONB)  # JSON: {emotion: "anxiety", dosha: "vata", context: "morning"}
    priority = Column(String(10))
    ai_explanation = Column(Text)
    
    # User response
    presented_to_user = Column(Boolean, default=False)
    user_accepted = Column(Boolean, default=False)
    saved_for_later = Column(Boolean, default=False)
    dismissed = Column(Boolean, default=False)
    
    # Completion tracking
    attempted = Column(Boolean, default=False)
    completed = Column(Boolean, default=False)
    completion_timestamp = Column(TIMESTAMP)
    effectiveness_rating = Column(Integer)
    feedback_notes = Column(Text)

    __table_args__ = (
        CheckConstraint(
            "priority IN ('high', 'medium', 'low')",
            name='chk_priority'
        ),
        CheckConstraint(
            "effectiveness_rating >= 1 AND effectiveness_rating <= 5",
            name='chk_effectiveness_rating'
        ),
    )