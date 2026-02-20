# app/models/user_streaks.py

from sqlalchemy import Column, String, Integer, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database.connection import Base


class UserStreak(Base):
    __tablename__ = "user_streaks"

    streak_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_active_date = Column(Date)