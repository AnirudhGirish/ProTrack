from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from typing import Optional
from database.connection import get_db
from models.file import File
from models.user import User
from schemas.file import FileCreate, FileUpdate, FileStatusUpdate, FileResponse, FileListResponse
from services.file_service import change_file_status
from services.audit_service import log_audit
from api.deps import get_current_user, get_current_admin, get_current_admin_or_section_head
from utils.pagination import paginate
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("")
async def list_files(
    request: Request,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    section: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(File)
    if status_filter:
        query = query.filter(File.status == status_filter)
    if section:
        query = query.filter(File.section == section)
    if search:
        query = query.filter(
            File.file_no.ilike(f"%{search}%") | File.subject.ilike(f"%{search}%")
        )
    if current_user.role == "employee":
        query = query.filter(File.assigned_to == current_user.id)
    elif current_user.role == "section_head" and current_user.section:
        query = query.filter(File.section == current_user.section)

    query = query.order_by(File.updated_at.desc())
    result = paginate(query, page, page_size)
    return result


@router.get("/{file_id}", response_model=FileResponse)
async def get_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # RBAC: employees can only read files assigned to them
    if current_user.role == "employee" and file.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    # RBAC: section heads can only read files in their section
    if current_user.role == "section_head" and current_user.section and file.section != current_user.section:
        raise HTTPException(status_code=403, detail="Access denied")

    return file



@router.post("", response_model=FileResponse, status_code=201)
async def create_file(
    data: FileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_or_section_head),
):
    existing = db.query(File).filter(File.file_no == data.file_no).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"File {data.file_no} already exists")

    file = File(
        file_no=data.file_no,
        subject=data.subject,
        section=data.section,
        status=data.status,
        created_date=data.created_date,
        closed_date=data.closed_date,
        initiated_by=data.initiated_by,
        current_user=data.current_user,
        movements=data.movements,
        remarks=data.remarks,
        due_date=data.due_date,
        priority=data.priority,
        created_by=current_user.id,
    )
    db.add(file)
    db.commit()
    db.refresh(file)

    log_audit(db, current_user.id, "create", "file", file.id, new_value={"file_no": file.file_no, "subject": file.subject})
    return file


@router.patch("/{file_id}", response_model=FileResponse)
async def update_file(
    file_id: str,
    data: FileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_or_section_head),
):
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    old_data = {"subject": file.subject, "section": file.section, "priority": file.priority}
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(file, key, value)
    db.commit()
    db.refresh(file)

    log_audit(db, current_user.id, "update", "file", file.id, old_value=old_data, new_value={"subject": file.subject, "section": file.section})
    return file


@router.patch("/{file_id}/status", response_model=FileResponse)
async def update_file_status(
    file_id: str,
    data: FileStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    if current_user.role == "employee" and file.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update status of files assigned to you")

    try:
        change_file_status(db, file, data.to_status, current_user.id, data.remarks)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    log_audit(db, current_user.id, "status_change", "file", file.id, new_value={"status": data.to_status})
    return file


@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    db.delete(file)
    db.commit()
    log_audit(db, current_user.id, "delete", "file", file_id, old_value={"file_no": file.file_no})
    return {"message": "File deleted successfully"}
