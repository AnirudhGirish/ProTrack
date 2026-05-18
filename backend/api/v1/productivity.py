from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from database.connection import get_db
from models.user import User
from services.productivity_service import get_productivity_payload
from api.deps import get_current_user

router = APIRouter()


@router.get("/dashboard")
async def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_productivity_payload(db)


@router.get("/sections")
async def section_breakdown(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from services.productivity_service import _compute_section_breakdown
    return _compute_section_breakdown(db)


@router.get("/employees")
async def employee_scores(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from services.productivity_service import _compute_employee_scores
    return _compute_employee_scores(db)


@router.get("/underperforming")
async def underperforming_sections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from services.productivity_service import _detect_underperforming
    return _detect_underperforming(db)
