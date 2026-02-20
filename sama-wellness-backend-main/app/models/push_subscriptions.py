# app/models/push_subscriptions.py

from sqlalchemy import Column, String, Text, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database.connection import Base
from sqlalchemy.sql import func


class PushSubscription(Base):
    __tablename__ = "push_subscriptions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    endpoint = Column(Text, nullable=False)
    p256dh_key = Column(Text, nullable=False)
    auth_secret = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, default=func.now())
    last_active = Column(TIMESTAMP, default=func.now())