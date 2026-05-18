from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime
from database.connection import get_db
from models.file import File
from models.assignment import EmployeeAssignment
from models.user import User
from schemas.file import FileResponse, FileListResponse
from api.deps import get_current_user
from services.audit_service import log_audit
from services.notification_service import create_notification
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/summary")
async def employee_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Personal stats: files assigned to this employee (by admin or self-assigned)."""
    file_ids = db.query(EmployeeAssignment.file_id).filter(
        EmployeeAssignment.employee_id == current_user.id,
        EmployeeAssignment.unassigned_at.is_(None),
    ).all()
    file_ids = [f[0] for f in file_ids]

    files = db.query(File).filter(File.id.in_(file_ids)).all() if file_ids else []
    total = len(files)
    completed = sum(1 for f in files if f.status == "closed")
    pending = total - completed
    in_progress = sum(1 for f in files if f.status == "in_progress")
    return {
        "total": total,
        "pending": pending,
        "completed": completed,
        "in_progress": in_progress,
        "section": current_user.section,
    }


@router.get("/tasks")
async def employee_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Files currently assigned to this employee (admin-assigned OR self-assigned)."""
    assignments = db.query(EmployeeAssignment).filter(
        EmployeeAssignment.employee_id == current_user.id,
        EmployeeAssignment.unassigned_at.is_(None),
    ).all()
    if not assignments:
        return []

    file_ids = [a.file_id for a in assignments]
    files = db.query(File).filter(File.id.in_(file_ids)).order_by(File.updated_at.desc()).all()

    assignment_map = {a.file_id: a for a in assignments}
    result = []
    for f in files:
        assign = assignment_map.get(f.id)
        result.append({
            "id": f.id,
            "file_no": f.file_no,
            "subject": f.subject,
            "section": f.section,
            "status": f.status,
            "created_date": f.created_date.isoformat() if f.created_date else None,
            "closed_date": f.closed_date.isoformat() if f.closed_date else None,
            "initiated_by": f.initiated_by,
            "current_user": f.current_user,
            "movements": f.movements,
            "remarks": f.remarks,
            "due_date": f.due_date.isoformat() if f.due_date else None,
            "priority": assign.priority if assign else f.priority,
            "processing_days": f.processing_days,
            "assigned_by_self": assign.assigned_by == current_user.id if assign else False,
            "created_at": f.created_at.isoformat() if f.created_at else None,
            "updated_at": f.updated_at.isoformat() if f.updated_at else None,
        })
    return result


@router.get("/section-files")
async def employee_section_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Files in the employee's section that are available to be taken up:
    - Status is NOT closed
    - File is either unassigned (assigned_to is None) OR already assigned to current user
    - Section matches current user's section
    Employee can only see & take up files within their own section.
    """
    if not current_user.section:
        return []

    # Get IDs already assigned to this employee so we can exclude them
    already_assigned_ids = set(
        f[0] for f in db.query(EmployeeAssignment.file_id).filter(
            EmployeeAssignment.employee_id == current_user.id,
            EmployeeAssignment.unassigned_at.is_(None),
        ).all()
    )

    # Files in same section, not closed, not already assigned to anyone else
    files = (
        db.query(File)
        .filter(
            File.section == current_user.section,
            File.status != "closed",
            File.assigned_to.is_(None),  # Only show files with no current assignee
        )
        .order_by(File.created_date.asc())  # Oldest first — take up oldest pending first
        .all()
    )

    # Exclude any already assigned to self (those show up in My Tasks)
    files = [f for f in files if f.id not in already_assigned_ids]

    result = []
    for f in files:
        result.append({
            "id": f.id,
            "file_no": f.file_no,
            "subject": f.subject,
            "section": f.section,
            "status": f.status,
            "priority": f.priority,
            "created_date": f.created_date.isoformat() if f.created_date else None,
            "due_date": f.due_date.isoformat() if f.due_date else None,
            "initiated_by": f.initiated_by,
            "movements": f.movements,
            "created_at": f.created_at.isoformat() if f.created_at else None,
        })
    return result


@router.post("/self-assign/{file_id}", status_code=201)
async def self_assign_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Employee takes up an unassigned file in their section.
    Creates an EmployeeAssignment with themselves as both employee and assigned_by.
    Sets file status to in_progress.
    """
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # Must be in same section
    if current_user.section and file.section != current_user.section:
        raise HTTPException(
            status_code=403,
            detail=f"You can only take up files in your section ({current_user.section})"
        )

    # Must be unassigned
    if file.assigned_to is not None:
        raise HTTPException(status_code=409, detail="This file is already assigned to someone else")

    # Must not be closed
    if file.status == "closed":
        raise HTTPException(status_code=400, detail="Cannot take up a closed file")

    # Check not already assigned to self
    existing = db.query(EmployeeAssignment).filter(
        EmployeeAssignment.employee_id == current_user.id,
        EmployeeAssignment.file_id == file_id,
        EmployeeAssignment.unassigned_at.is_(None),
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already taken up this file")

    # Create assignment — self-assigned means assigned_by == employee
    assignment = EmployeeAssignment(
        employee_id=current_user.id,
        file_id=file_id,
        assigned_by=current_user.id,  # self-assigned
        priority=file.priority or "normal",
    )
    file.assigned_to = current_user.id

    # If file is in 'received' status, move it to in_progress automatically
    if file.status == "received":
        file.status = "in_progress"

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    log_audit(
        db, current_user.id, "self_assign", "file", file_id,
        new_value={"file_no": file.file_no, "employee": current_user.username}
    )

    logger.info(f"Employee {current_user.username} self-assigned file {file.file_no}")
    return {
        "message": f"You have taken up file {file.file_no}",
        "assignment_id": assignment.id,
        "file_no": file.file_no,
        "subject": file.subject,
        "status": file.status,
    }
