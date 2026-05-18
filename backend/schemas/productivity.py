from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date


class SectionBreakdown(BaseModel):
    section: str
    total: int
    completed: int
    pending: int
    avg_processing_days: Optional[float] = None


class EmployeeScore(BaseModel):
    employee_id: str
    employee_name: str
    section: Optional[str] = None
    total: int
    completed: int
    pending: int
    avg_processing_days: Optional[float] = None
    productivity_score: float


class UnderperformingSection(BaseModel):
    section: str
    total: int
    completed: int
    pending: int
    pending_ratio: float
    avg_processing_days: Optional[float] = None
    reasons: List[str]


class OldPendingFile(BaseModel):
    file_no: str
    subject: str
    section: str
    current_user: Optional[str] = None
    pending_days: int
    priority: str
    due_date: Optional[date] = None


class ProductivityPayload(BaseModel):
    total_files: int
    completed: int
    pending: int
    avg_processing_time_days: Optional[float] = None
    completion_rate: float
    section_breakdown: List[SectionBreakdown]
    employee_scores: List[EmployeeScore]
    underperforming_sections: List[UnderperformingSection]
    old_pending_files: List[OldPendingFile]
    insights: List[str]
    llm_snapshot: Optional[Dict[str, Any]] = None
