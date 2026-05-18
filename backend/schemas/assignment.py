from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class AssignmentCreate(BaseModel):
    employee_id: str
    file_id: str
    priority: str = Field(default="normal")
    notes: Optional[str] = None


class BulkAssignmentCreate(BaseModel):
    employee_id: str
    file_ids: List[str]
    priority: str = Field(default="normal")


class AssignmentResponse(BaseModel):
    id: str
    employee_id: str
    file_id: str
    assigned_by: str
    assigned_at: datetime
    unassigned_at: Optional[datetime] = None
    priority: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True
