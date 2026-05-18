from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime
from database.connection import get_db
from models.assignment import EmployeeAssignment
from models.file import File
from models.user import User
from schemas.assignment import AssignmentCreate, BulkAssignmentCreate, AssignmentResponse
from services.audit_service import log_audit
from services.notification_service import create_notification
from api.deps import get_current_user, get_current_admin_or_section_head

router = APIRouter()


@router.get("")
async def list_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_or_section_head),
):
    """List all active file→employee assignments. Admin/section head only."""
    assignments = db.query(EmployeeAssignment).filter(
        EmployeeAssignment.unassigned_at.is_(None)
    ).all()

    result = []
    for a in assignments:
        file = db.query(File).filter(File.id == a.file_id).first()
        employee = db.query(User).filter(User.id == a.employee_id).first()
        result.append({
            "id": a.id,
            "file_id": a.file_id,
            "file_no": file.file_no if file else None,
            "file_subject": file.subject if file else None,
            "employee_id": a.employee_id,
            "employee_name": employee.full_name or employee.username if employee else None,
            "employee_username": employee.username if employee else None,
            "priority": a.priority,
            "assigned_at": a.assigned_at.isoformat() if a.assigned_at else None,
            "self_assigned": a.assigned_by == a.employee_id,
        })
    return result


@router.post("", response_model=AssignmentResponse, status_code=201)
async def assign_file(
    data: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_or_section_head),
):
    employee = db.query(User).filter(User.id == data.employee_id, User.is_active == True).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    file = db.query(File).filter(File.id == data.file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    existing = db.query(EmployeeAssignment).filter(
        EmployeeAssignment.employee_id == data.employee_id,
        EmployeeAssignment.file_id == data.file_id,
        EmployeeAssignment.unassigned_at.is_(None),
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="File is already assigned to this employee")

    assignment = EmployeeAssignment(
        employee_id=data.employee_id,
        file_id=data.file_id,
        assigned_by=current_user.id,
        priority=data.priority,
        notes=data.notes,
    )
    file.assigned_to = data.employee_id
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    log_audit(db, current_user.id, "assign", "assignment", assignment.id, new_value={"file_id": data.file_id, "employee_id": data.employee_id})
    create_notification(
        db, data.employee_id, "file_assigned",
        "New File Assigned", f"File {file.file_no}: {file.subject} has been assigned to you.",
        entity_type="file", entity_id=data.file_id,
    )
    return assignment


@router.delete("/{assignment_id}")
async def unassign_file(
    assignment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_or_section_head),
):
    assignment = db.query(EmployeeAssignment).filter(EmployeeAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    assignment.unassigned_at = datetime.utcnow()
    file = db.query(File).filter(File.id == assignment.file_id).first()
    if file:
        file.assigned_to = None
    db.commit()

    log_audit(db, current_user.id, "unassign", "assignment", assignment_id)
    return {"message": "File unassigned successfully"}


@router.post("/bulk")
async def bulk_assign(
    data: BulkAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_or_section_head),
):
    employee = db.query(User).filter(User.id == data.employee_id, User.is_active == True).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    success = 0
    skipped = 0
    for file_id in data.file_ids:
        file = db.query(File).filter(File.id == file_id).first()
        if not file:
            skipped += 1
            continue
        existing = db.query(EmployeeAssignment).filter(
            EmployeeAssignment.employee_id == data.employee_id,
            EmployeeAssignment.file_id == file_id,
            EmployeeAssignment.unassigned_at.is_(None),
        ).first()
        if existing:
            skipped += 1
            continue
        assignment = EmployeeAssignment(
            employee_id=data.employee_id,
            file_id=file_id,
            assigned_by=current_user.id,
            priority=data.priority,
        )
        file.assigned_to = data.employee_id
        db.add(assignment)
        success += 1

    db.commit()
    log_audit(db, current_user.id, "assign", "assignment", None, new_value={"bulk": True, "success": success, "skipped": skipped})
    return {"message": f"Assigned {success} files, skipped {skipped}", "success": success, "skipped": skipped}
