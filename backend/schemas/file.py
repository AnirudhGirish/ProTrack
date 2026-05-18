from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime, date


VALID_STATUSES = {"received", "in_progress", "under_review", "returned", "approved", "closed"}
VALID_PRIORITIES = {"low", "normal", "high", "critical"}

STATUS_TRANSITIONS = {
    "received": {"in_progress"},
    "in_progress": {"under_review", "closed"},
    "under_review": {"approved", "returned"},
    "returned": {"in_progress"},
    "approved": {"closed"},
    "closed": set(),
}


class FileCreate(BaseModel):
    file_no: str = Field(..., min_length=1, max_length=50)
    subject: str = Field(..., min_length=1)
    section: str = Field(..., min_length=1)
    status: str = Field(default="received")
    created_date: date
    closed_date: Optional[date] = None
    initiated_by: Optional[str] = None
    current_user: Optional[str] = None
    movements: int = Field(default=0, ge=0)
    remarks: Optional[str] = None
    due_date: Optional[date] = None
    priority: str = Field(default="normal")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in VALID_STATUSES:
            raise ValueError(f"Status must be one of: {VALID_STATUSES}")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        if v not in VALID_PRIORITIES:
            raise ValueError(f"Priority must be one of: {VALID_PRIORITIES}")
        return v


class FileUpdate(BaseModel):
    subject: Optional[str] = None
    section: Optional[str] = None
    initiated_by: Optional[str] = None
    current_user: Optional[str] = None
    movements: Optional[int] = Field(default=None, ge=0)
    remarks: Optional[str] = None
    due_date: Optional[date] = None
    priority: Optional[str] = None

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_PRIORITIES:
            raise ValueError(f"Priority must be one of: {VALID_PRIORITIES}")
        return v


class FileStatusUpdate(BaseModel):
    to_status: str
    remarks: Optional[str] = None

    @field_validator("to_status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in VALID_STATUSES:
            raise ValueError(f"Status must be one of: {VALID_STATUSES}")
        return v


class FileResponse(BaseModel):
    id: str
    file_no: str
    subject: str
    section: str
    status: str
    created_date: date
    closed_date: Optional[date] = None
    initiated_by: Optional[str] = None
    current_user: Optional[str] = None
    assigned_to: Optional[str] = None
    movements: int
    remarks: Optional[str] = None
    due_date: Optional[date] = None
    priority: str
    processing_days: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FileListResponse(FileResponse):
    assigned_employee_name: Optional[str] = None
    assigned_employee_id: Optional[str] = None
