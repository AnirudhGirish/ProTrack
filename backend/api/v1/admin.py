from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from database.connection import get_db
from models.user import User
from models.file import File as FileModel
from models.sla import SLAConfig
from models.csv_import import CSVImport
from schemas.auth import UserCreate, UserUpdate, UserResponse
from services.auth_service import hash_password
from services.audit_service import log_audit
from api.deps import get_current_admin
from utils.pagination import paginate
import pandas as pd
import io
import csv
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    query = db.query(User).order_by(User.created_at.desc())
    result = paginate(query, page, page_size)
    result["items"] = [UserResponse.model_validate(u) for u in result["items"]]
    return result


@router.post("/users", response_model=UserResponse, status_code=201)
async def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    existing = db.query(User).filter(User.username == data.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    if data.employee_id:
        existing_emp = db.query(User).filter(User.employee_id == data.employee_id).first()
        if existing_emp:
            raise HTTPException(status_code=400, detail="Employee ID already exists")

    user = User(
        username=data.username,
        password_hash=hash_password(data.password),
        role=data.role,
        employee_id=data.employee_id,
        section=data.section,
        full_name=data.full_name,
        email=data.email,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    log_audit(db, current_user.id, "user_create", "user", user.id, new_value={"username": user.username, "role": user.role})
    return user


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    log_audit(db, current_user.id, "user_update", "user", user_id)
    return user


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = False
    db.commit()
    log_audit(db, current_user.id, "delete", "user", user_id)
    return {"message": f"User {user.username} deactivated"}


@router.post("/import-csv")
async def import_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")

    required_cols = {"File_No", "Subject", "Section", "Status"}
    missing = required_cols - set(df.columns)
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required columns: {missing}")

    rows_created = 0
    rows_updated = 0
    rows_skipped = 0

    status_map = {
        "pending": "received", "completed": "closed",
        "active": "received", "done": "closed",
    }

    for idx, row in df.iterrows():
        try:
            file_no = str(row.get("File_No", "")).strip()
            if not file_no:
                rows_skipped += 1
                continue

            created_date = pd.to_datetime(row.get("Created_Date"), errors="coerce")
            closed_date = pd.to_datetime(row.get("Closed_Date"), errors="coerce")
            due_date = pd.to_datetime(row.get("Due_Date"), errors="coerce") if "Due_Date" in df.columns else None

            raw_status = str(row.get("Status", "received")).strip().lower()
            mapped_status = status_map.get(raw_status, raw_status)

            existing = db.query(FileModel).filter(FileModel.file_no == file_no).first()

            if existing:
                existing.subject = str(row.get("Subject", existing.subject))
                existing.section = str(row.get("Section", existing.section))
                existing.status = mapped_status
                if pd.notna(created_date):
                    existing.created_date = created_date.date()
                if pd.notna(closed_date):
                    existing.closed_date = closed_date.date()
                existing.initiated_by = str(row.get("Initiated_By", "")) if pd.notna(row.get("Initiated_By", "")) else None
                existing.current_user = str(row.get("Current_User", "")) if pd.notna(row.get("Current_User", "")) else None
                existing.movements = int(row.get("Movements", 0)) if pd.notna(row.get("Movements", 0)) else 0
                existing.remarks = str(row.get("Remarks", "")) if pd.notna(row.get("Remarks", "")) else None
                if due_date is not None and pd.notna(due_date):
                    existing.due_date = due_date.date()
                rows_updated += 1
            else:
                new_file = FileModel(
                    file_no=file_no,
                    subject=str(row.get("Subject", "")),
                    section=str(row.get("Section", "")),
                    status=mapped_status,
                    created_date=created_date.date() if pd.notna(created_date) else datetime.utcnow().date(),
                    closed_date=closed_date.date() if pd.notna(closed_date) else None,
                    initiated_by=str(row.get("Initiated_By", "")) if pd.notna(row.get("Initiated_By", "")) else None,
                    current_user=str(row.get("Current_User", "")) if pd.notna(row.get("Current_User", "")) else None,
                    movements=int(row.get("Movements", 0)) if pd.notna(row.get("Movements", 0)) else 0,
                    remarks=str(row.get("Remarks", "")) if pd.notna(row.get("Remarks", "")) else None,
                    due_date=due_date.date() if due_date is not None and pd.notna(due_date) else None,
                    created_by=current_user.id,
                )
                db.add(new_file)
                rows_created += 1
        except Exception as exc:
            logger.warning(f"CSV import: skipped row {idx} (file_no={row.get('File_No', '?')}): {exc}")
            rows_skipped += 1

    db.commit()

    rows_imported = rows_created + rows_updated
    csv_import = CSVImport(
        uploaded_by=current_user.id,
        filename=file.filename,
        rows_imported=rows_imported,
        rows_skipped=rows_skipped,
        status="success" if rows_skipped == 0 else "partial",
    )
    db.add(csv_import)
    db.commit()

    log_audit(db, current_user.id, "csv_import", "csv_import", csv_import.id, new_value={"created": rows_created, "updated": rows_updated, "skipped": rows_skipped})
    return {
        "message": f"Import complete: {rows_created} created, {rows_updated} updated, {rows_skipped} skipped",
        "rows_created": rows_created,
        "rows_updated": rows_updated,
        "rows_imported": rows_imported,
        "rows_skipped": rows_skipped,
    }


@router.get("/export-csv")
async def export_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    files = db.query(FileModel).all()
    output = io.StringIO()
    # Use csv.writer so any commas/quotes inside field values are properly escaped
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)
    writer.writerow([
        "File_No", "Subject", "Created_Date", "Closed_Date",
        "Initiated_By", "Current_User", "Section", "Status",
        "Movements", "Remarks", "Due_Date", "Priority",
    ])
    for f in files:
        writer.writerow([
            f.file_no,
            f.subject,
            f.created_date,
            f.closed_date or "",
            f.initiated_by or "",
            f.current_user or "",
            f.section,
            f.status,
            f.movements,
            f.remarks or "",
            f.due_date or "",
            f.priority,
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=forest_eoffice_data.csv"},
    )


@router.get("/import-history")
async def import_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    query = db.query(CSVImport).order_by(CSVImport.created_at.desc())
    return paginate(query, page, page_size)


@router.get("/audit-log")
async def audit_log(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    entity_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    from models.audit import AuditLog
    query = db.query(AuditLog).order_by(AuditLog.created_at.desc())
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    return paginate(query, page, page_size)


@router.get("/sla-config")
async def get_sla_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    configs = db.query(SLAConfig).all()
    return [{"id": c.id, "section": c.section, "max_pending_ratio": c.max_pending_ratio, "max_processing_days": c.max_processing_days, "auto_escalate_days": c.auto_escalate_days} for c in configs]


@router.patch("/sla-config/{config_id}")
async def update_sla_config(
    config_id: str,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    config = db.query(SLAConfig).filter(SLAConfig.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="SLA config not found")
    for key in ["max_pending_ratio", "max_processing_days", "auto_escalate_days"]:
        if key in data:
            setattr(config, key, data[key])
    db.commit()
    return {"message": "SLA config updated"}


@router.get("/stats")
async def system_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    total_files = db.query(FileModel).count()
    total_users = db.query(User).filter(User.is_active == True).count()
    completed = db.query(FileModel).filter(FileModel.status == "closed").count()
    pending = total_files - completed
    return {
        "total_files": total_files,
        "total_users": total_users,
        "completed": completed,
        "pending": pending,
        "sections": db.query(FileModel.section).distinct().count(),
    }
