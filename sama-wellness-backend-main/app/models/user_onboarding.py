from sqlalchemy import Column, String, Boolean, JSON, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
from datetime import datetime

from app.database.connection import Base


class UserOnboarding(Base):
    """
    Matches the real schema.sql user_onboarding table.
    Table name is 'user_onboarding', NOT 'questionnaire_sessions'.
    """

    __tablename__ = "user_onboarding"

    onboarding_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    # Step completion flags (schema.sql)
    step_1_completed = Column(Boolean, default=False)   # Health check (5 questions)
    step_2_completed = Column(Boolean, default=False)   # First conversation
    step_3_completed = Column(Boolean, default=False)   # Dosha quiz

    # Health baseline JSONB: {sleep: 7, energy: 5, appetite: 8, pain: 2, medications: []}
    health_baseline = Column(JSONB)

    onboarding_date = Column(DateTime, default=datetime.utcnow)
