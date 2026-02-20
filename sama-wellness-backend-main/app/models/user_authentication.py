# app/models/user_authentication.py

from sqlalchemy import Column, String, Integer, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database.connection import Base


class UserAuthentication(Base):
    __tablename__ = "user_authentication"

    auth_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    password_hash = Column(String(255))
    google_id = Column(String(100), unique=True)
    apple_id = Column(String(100), unique=True)
    last_login_at = Column(TIMESTAMP)
    failed_attempts = Column(Integer, default=0)
    locked_until = Column(TIMESTAMP)