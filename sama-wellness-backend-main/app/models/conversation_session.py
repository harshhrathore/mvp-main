# app/models/conversation_session.py

from sqlalchemy import Column, String, Integer, ForeignKey, CheckConstraint, JSON
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database.connection import Base


class ConversationSession(Base):
    __tablename__ = "conversation_sessions"

    session_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_type = Column(String(20), default='regular')
    start_time = Column(TIMESTAMP, default=func.now())
    end_time = Column(TIMESTAMP)
    duration_seconds = Column(Integer)
    device_info = Column(JSON)  # JSON: {model: "iPhone 13", os: "iOS 16.5"}
    network_type = Column(String(10))
    location_city = Column(String(50))

    __table_args__ = (
        CheckConstraint(
            "session_type IN ('first_chat', 'regular', 'crisis', 'checkin')",
            name='chk_session_type'
        ),
    )