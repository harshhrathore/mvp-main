# app/models/user_preferences.py

from sqlalchemy import Column, String, Boolean, ForeignKey, Time, Integer, CheckConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from datetime import time
import uuid
from app.database.connection import Base


class UserPreferences(Base):
    """
    Matches schema.sql user_preferences table + migration 001_update_schema.sql additions:
    - emotional_attachment (INTEGER, 1-10)
    - dosha_type_id (INTEGER FK → dosha_types)
    - nickname (VARCHAR 50)
    """
    __tablename__ = "user_preferences"

    preference_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Voice settings
    voice_gender = Column(String(10), default='female')
    speaking_speed = Column(String(10), default='normal')
    background_sounds = Column(Boolean, default=True)
    preferred_language = Column(String(10), default='English')

    # Notification settings
    morning_reminder = Column(Boolean, default=True)
    evening_checkin = Column(Boolean, default=True)
    weekly_insights = Column(Boolean, default=True)
    quiet_hours_start = Column(Time, default=time(22, 0, 0))
    quiet_hours_end = Column(Time, default=time(7, 0, 0))

    # Content preferences
    favorite_practices = Column(JSONB)
    disliked_practices = Column(JSONB)
    learning_level = Column(String(20), default='beginner')

    # Privacy
    data_for_research = Column(Boolean, default=False)
    anonymized_data = Column(Boolean, default=True)
    delete_after_inactive = Column(String(20), default='1year')

    # Added by migration 001_update_schema.sql (add_sama_chat_preferences.sql in new_backend)
    emotional_attachment = Column(Integer, default=8)   # 1-10 scale for SAMA warmth
    dosha_type_id = Column(Integer, ForeignKey("dosha_types.id", ondelete="RESTRICT"), nullable=True)
    nickname = Column(String(50), default='friend')

    __table_args__ = (
        CheckConstraint('emotional_attachment >= 1 AND emotional_attachment <= 10', name='chk_emotional_attachment'),
    )
