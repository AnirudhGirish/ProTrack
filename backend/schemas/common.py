from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any, Dict
from datetime import datetime, date
from uuid import UUID


class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int


class ErrorResponse(BaseModel):
    error: dict


class DateRangeFilter(BaseModel):
    from_date: Optional[date] = None
    to_date: Optional[date] = None
