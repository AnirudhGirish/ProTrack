import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from database.connection import Base


class Section(Base):
    __tablename__ = "sections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
