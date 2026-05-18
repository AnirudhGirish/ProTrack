import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Index
from database.connection import Base
import enum


class UserRole(str, enum.Enum):
    admin = "admin"
    section_head = "section_head"
    employee = "employee"
    readonly = "readonly"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default=UserRole.employee.value)
    employee_id = Column(String(50), unique=True, nullable=True, index=True)
    section = Column(String(100), nullable=True, index=True)
    full_name = Column(String(200), nullable=True)
    email = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)


Index("idx_users_section", User.section)
