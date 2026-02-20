# app/models/ayurveda_knowledge.py

from sqlalchemy import Column, String, Integer, TIMESTAMP, Text, CheckConstraint, JSON, DECIMAL
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database.connection import Base


class AyurvedaKnowledge(Base):
    __tablename__ = "ayurveda_knowledge"

    knowledge_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_type = Column(String(20), nullable=False)
    title = Column(String(200), nullable=False)
    description_short = Column(Text)
    description_detailed = Column(Text)
    
    # Ayurvedic properties - stored as JSON strings for SQLite
    balances_doshas = Column(JSON)  # JSON array: ['Vata', 'Pitta']
    aggravates_doshas = Column(JSON)
    best_for_season = Column(String(20))
    best_time_of_day = Column(String(20))
    
    # Emotional benefits - stored as JSON strings for SQLite
    helps_with_emotions = Column(JSON)  # JSON array: ['anxiety', 'stress', 'anger']
    not_recommended_for = Column(JSON)
    emotional_intensity = Column(String(10))
    
    # Practical details
    duration_minutes = Column(Integer)
    difficulty = Column(String(20))
    equipment_needed = Column(String(50))
    location = Column(String(50))
    
    # Instructions
    steps = Column(JSON)  # JSON: [{step: 1, instruction: "Sit comfortably..."}]
    precautions = Column(JSON)  # JSON array
    video_url = Column(Text)
    audio_guide_url = Column(Text)
    
    # Research & effectiveness
    traditional_source = Column(String(100))
    research_studies = Column(JSON)  # JSON array
    user_success_rate = Column(DECIMAL(3,2), default=0.0)
    times_recommended = Column(Integer, default=0)
    avg_effectiveness_rating = Column(DECIMAL(2,1), default=0.0)
    
    from sqlalchemy.sql import func
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default='CURRENT_TIMESTAMP')

    __table_args__ = (
        CheckConstraint(
            "content_type IN ('breathing', 'yoga', 'diet', 'herb', 'lifestyle', 'mantra')",
            name='chk_content_type'
        ),
        CheckConstraint(
            "difficulty IN ('beginner', 'intermediate', 'advanced')",
            name='chk_difficulty'
        ),
    )