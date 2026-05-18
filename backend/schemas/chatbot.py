from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    session_id: str
    summary: Optional[dict] = None
    section_summary: Optional[dict] = None
    underperforming: Optional[list] = None
    old_pending_files: Optional[list] = None
    suggestions: Optional[list] = None
    evidence_count: Optional[int] = None
    evidence: Optional[list] = None


class ChatSessionResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int

    class Config:
        from_attributes = True


class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    llm_provider: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
