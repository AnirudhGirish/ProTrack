import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, UniqueConstraint, Index
from database.connection import Base


class EmployeeAssignment(Base):
    __tablename__ = "employee_assignments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    file_id = Column(String(36), ForeignKey("files.id"), nullable=False, index=True)
    assigned_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    assigned_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    unassigned_at = Column(DateTime, nullable=True)
    priority = Column(String(20), nullable=False, default="normal")
    notes = Column(Text, nullable=True)

    __table_args__ = (
        Index("idx_active_assignments", employee_id, file_id, unassigned_at),
    )
