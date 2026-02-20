# app/models/dosha_types.py

from sqlalchemy import Column, String, Integer, Text, TIMESTAMP
from sqlalchemy.sql import func
from app.database.connection import Base


class DoshaType(Base):
    """
    Added by migration 001_update_schema.sql.
    Lookup table: Vata, Pitta, Kapha with descriptions.
    Referenced by user_preferences.dosha_type_id and dosha_tracking.dosha_type_id.
    """
    __tablename__ = "dosha_types"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)   # 'Vata', 'Pitta', 'Kapha'
    description = Column(Text)
    created_at = Column(TIMESTAMP, default=func.now())
