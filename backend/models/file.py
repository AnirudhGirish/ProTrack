import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Date, DateTime, ForeignKey, Text, Index
from database.connection import Base


class File(Base):
    __tablename__ = "files"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    file_no = Column(String(50), unique=True, nullable=False, index=True)
    subject = Column(Text, nullable=False)
    section = Column(String(100), nullable=False, index=True)
    status = Column(String(50), nullable=False, default="received", index=True)
    created_date = Column(Date, nullable=False)
    closed_date = Column(Date, nullable=True)
    initiated_by = Column(String(200), nullable=True)
    current_user = Column(String(200), nullable=True)
    assigned_to = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    movements = Column(Integer, nullable=False, default=0)
    remarks = Column(Text, nullable=True)
    due_date = Column(Date, nullable=True)
    priority = Column(String(20), nullable=False, default="normal")
    processing_days = Column(Integer, nullable=True)
    created_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


Index("idx_files_section_status", File.section, File.status)
Index("idx_files_assigned_to", File.assigned_to)
