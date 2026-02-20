# app/models/dosha_tracking.py

from sqlalchemy import Column, String, Integer, ForeignKey, TIMESTAMP, CheckConstraint, Date
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func
import uuid
from app.database.connection import Base


class DoshaTracking(Base):
    """
    Matches schema.sql dosha_tracking table + migration 001_update_schema.sql:
    - Added dosha_type_id (INTEGER FK → dosha_types)
    """
    __tablename__ = "dosha_tracking"

    tracking_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False)

    # Current state (vikriti)
    vikriti_scores = Column(JSONB)           # {vata: 0.75, pitta: 0.20, kapha: 0.05}
    dominant_imbalance = Column(String(10))  # 'Vata', 'Pitta', 'Kapha'
    imbalance_intensity = Column(Integer)    # 1-10

    # Emotion mapping
    detected_emotion = Column(String(50))
    emotion_to_dosha_mapping = Column(JSONB)

    # Trends
    weekly_balance_score = Column(Integer)
    monthly_trend = Column(String(20))

    # Added by migration 001_update_schema.sql
    dosha_type_id = Column(Integer, ForeignKey("dosha_types.id", ondelete="RESTRICT"), nullable=True)

    created_at = Column(TIMESTAMP, default=func.now())

    __table_args__ = (
        CheckConstraint('imbalance_intensity >= 1 AND imbalance_intensity <= 10', name='chk_intensity_range'),
    )
