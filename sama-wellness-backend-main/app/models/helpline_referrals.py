# app/models/helpline_referrals.py

from sqlalchemy import Column, String, Boolean, TIMESTAMP, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func
import uuid
from app.database.connection import Base


class HelplineReferral(Base):
    __tablename__ = "helpline_referrals"

    referral_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    safety_id = Column(String, ForeignKey("safety_monitoring.safety_id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Referral details
    helpline_name = Column(String(100), nullable=False)
    contact_number = Column(String(20), nullable=False)
    contact_method = Column(String(20))
    operating_hours = Column(String(50))
    languages = Column(JSONB)  # JSON array
    
    # User action
    suggested_at = Column(TIMESTAMP, default=func.now())
    user_acknowledged = Column(Boolean, default=False)
    user_contacted = Column(Boolean, default=False)
    contact_timestamp = Column(TIMESTAMP)
    outcome_notes = Column(Text)