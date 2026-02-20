# app/models/api_usage_metrics.py

from sqlalchemy import Column, String, Integer, TIMESTAMP, ForeignKey, DECIMAL
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database.connection import Base


class ApiUsageMetric(Base):
    __tablename__ = "api_usage_metrics"

    metric_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    api_provider = Column(String(50))
    endpoint_used = Column(String(200))
    tokens_used = Column(Integer)
    characters_processed = Column(Integer)
    cost_incurred = Column(DECIMAL(10,4))
    timestamp = Column(TIMESTAMP, default=func.now(), index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))