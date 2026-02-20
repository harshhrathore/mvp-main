# app/models/dosha_assessment.py

from sqlalchemy import Column, String, Text, Boolean, DECIMAL, CheckConstraint, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP
import uuid
from app.database.connection import Base


class DoshaAssessment(Base):
    __tablename__ = "dosha_assessment"

    assessment_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_type = Column(String(20), default='initial')
    completed_at = Column(TIMESTAMP, default=func.now())
    
    # Question data
    questions_version = Column(String(10), default='v1.0')
    responses = Column(JSONB, nullable=False)  # JSON: All 15 questions + answers
    response_times = Column(JSONB)  # JSON for research
    
    # Calculation results
    prakriti_scores = Column(JSONB, nullable=False)  # JSON: {vata: 0.65, pitta: 0.25, kapha: 0.10}
    primary_dosha = Column(String(10), nullable=False)
    secondary_dosha = Column(String(10))
    confidence_score = Column(DECIMAL(3,2))
    
    # Research metadata
    research_sources = Column(Text)
    algorithm_version = Column(String(10), default='tier-weighted')
    expert_validated = Column(Boolean, default=False)

    __table_args__ = (
        CheckConstraint(
            "assessment_type IN ('initial', 'quarterly', 'ad_hoc')",
            name='chk_assessment_type'
        ),
    )