# app/models/user_insights_weekly.py

from sqlalchemy import Column, String, Date, TIMESTAMP, ForeignKey, CheckConstraint, Integer, DECIMAL
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func
import uuid
from app.database.connection import Base


class UserInsightsWeekly(Base):
    __tablename__ = "user_insights_weekly"

    insight_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    week_start_date = Column(Date, nullable=False, index=True)
    
    # Patterns
    emotion_pattern = Column(String(100))
    dosha_pattern = Column(String(100))
    trigger_patterns = Column(JSONB)  # JSON array
    
    # Progress
    week_over_week_change = Column(DECIMAL(5,2))  # Percentage
    consistency_score = Column(Integer)
    breakthrough_moments = Column(JSONB)
    
    # Recommendations
    most_effective_practice = Column(String, ForeignKey("ayurveda_knowledge.knowledge_id"))
    practice_completion_rate = Column(DECIMAL(5,2))
    suggested_focus_next_week = Column(String(10))
    
    created_at = Column(TIMESTAMP, default=func.now())

    __table_args__ = (
        CheckConstraint(
            "consistency_score >= 0 AND consistency_score <= 100",
            name='chk_consistency_score'
        ),
    )