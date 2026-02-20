# app/models/user.py

from sqlalchemy import Column, String, Date, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database.connection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(150), unique=True, nullable=False, index=True)
    phone = Column(String(15))
    full_name = Column(String(100), nullable=False)
    birth_date = Column(Date)
    gender = Column(String(20))
    country = Column(String(2), default='IN')
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now())
    account_status = Column(String(20), default='active')
    
    __table_args__ = (
        CheckConstraint(
            "account_status IN ('active', 'suspended', 'deleted')",
            name='chk_account_status'
        ),
    )