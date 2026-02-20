# app/models/error_logs.py

from sqlalchemy import Column, String, Text, ForeignKey, TIMESTAMP, Boolean
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func
import uuid
from app.database.connection import Base


class ErrorLog(Base):
    __tablename__ = "error_logs"

    error_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    error_type = Column(String(50))
    error_message = Column(Text)
    stack_trace = Column(Text)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    endpoint = Column(String(200))
    request_body = Column(JSONB)
    device_info = Column(JSONB)
    app_version = Column(String(20))
    timestamp = Column(TIMESTAMP, default=func.now(), index=True)
    resolved = Column(Boolean, default=False, index=True)