# app/models/safety_monitoring.py

from sqlalchemy import Column, String, Boolean, TIMESTAMP, ForeignKey, CheckConstraint, DECIMAL
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func
import uuid
from app.database.connection import Base


class SafetyMonitoring(Base):
    __tablename__ = "safety_monitoring"

    safety_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    message_id = Column(String, ForeignKey("conversation_messages.message_id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Detection
    trigger_type = Column(String(20))
    detected_keywords = Column(JSONB)  # JSON array
    crisis_level = Column(String(20))
    confidence_score = Column(DECIMAL(3,2))
    
    # Action taken
    protocol_activated = Column(Boolean, default=False)
    protocol_name = Column(String(50))
    ai_response_modified = Column(Boolean, default=False)
    helpline_suggested = Column(Boolean, default=False)
    
    # Follow-up
    followup_required = Column(Boolean, default=False)
    followup_scheduled = Column(TIMESTAMP)
    followup_completed = Column(Boolean, default=False)
    
    created_at = Column(TIMESTAMP, default=func.now(), index=True)

    __table_args__ = (
        CheckConstraint(
            "trigger_type IN ('keywords', 'bert_pattern', 'both')",
            name='chk_trigger_type'
        ),
        CheckConstraint(
            "crisis_level IN ('low', 'medium', 'high', 'critical')",
            name='chk_crisis_level'
        ),
    )