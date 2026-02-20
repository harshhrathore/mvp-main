# app/models/app_configuration.py

from sqlalchemy import Column, String, TIMESTAMP, JSON
import uuid
from app.database.connection import Base


class AppConfiguration(Base):
    __tablename__ = "app_configuration"

    config_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    config_key = Column(String(100), nullable=False, unique=True)
    config_value = Column(JSON, nullable=False)
    environment = Column(String(20), default='production')
    from sqlalchemy.sql import func
    updated_at = Column(TIMESTAMP, default=func.now())
    updated_by = Column(String)  # UUID reference