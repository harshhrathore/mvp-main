# app/models/user_progress_daily.py

from sqlalchemy import Column, String, Integer, Date, TIMESTAMP, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database.connection import Base


class UserProgressDaily(Base):
    __tablename__ = "user_progress_daily"
    
    progress_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    
    # Emotional health
    avg_emotion_score = Column(Integer)
    emotion_stability = Column(Integer)
    primary_emotion_day = Column(String(50))
    mood_swings_count = Column(Integer, default=0)
    
    # Ayurvedic balance
    dosha_balance_score = Column(Integer)
    dominant_imbalance = Column(String(10))
    imbalance_intensity = Column(Integer)
    
    # Engagement
    conversations_count = Column(Integer, default=0)
    total_chat_minutes = Column(Integer, default=0)
    practices_completed = Column(Integer, default=0)
    app_opens_count = Column(Integer, default=0)
    
    # Self-reported
    sleep_quality = Column(Integer)
    energy_levels = Column(Integer) 
    stress_level = Column(Integer)
    
    created_at = Column(TIMESTAMP, default='CURRENT_TIMESTAMP')
    
    __table_args__ = (
        CheckConstraint('sleep_quality >= 1 AND sleep_quality <= 10', name='chk_sleep_quality'),
        CheckConstraint('energy_levels >= 1 AND energy_levels <= 10', name='chk_energy_levels'),
        CheckConstraint('stress_level >= 1 AND stress_level <= 10', name='chk_stress_level'),
    )
