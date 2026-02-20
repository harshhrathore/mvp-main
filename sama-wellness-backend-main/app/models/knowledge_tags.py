# app/models/knowledge_tags.py

from sqlalchemy import Column, String, ForeignKey, CheckConstraint, DECIMAL
import uuid
from app.database.connection import Base


class KnowledgeTag(Base):
    __tablename__ = "knowledge_tags"

    tag_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    knowledge_id = Column(String, ForeignKey("ayurveda_knowledge.knowledge_id", ondelete="CASCADE"), nullable=False)
    tag_type = Column(String(20))
    tag_value = Column(String(50), nullable=False)
    relevance_score = Column(DECIMAL(3,2), default=1.0)

    __table_args__ = (
        CheckConstraint(
            "tag_type IN ('dosha', 'emotion', 'duration', 'difficulty', 'season')",
            name='chk_tag_type'
        ),
    )