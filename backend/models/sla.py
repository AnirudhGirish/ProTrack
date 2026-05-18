import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime
from database.connection import Base


class SLAConfig(Base):
    __tablename__ = "sla_config"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    section = Column(String(100), unique=True, nullable=False)
    max_pending_ratio = Column(Float, nullable=False, default=0.4)
    max_processing_days = Column(Integer, nullable=False, default=10)
    auto_escalate_days = Column(Integer, nullable=False, default=14)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
