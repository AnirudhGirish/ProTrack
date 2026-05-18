from models.file import File
from models.file_status_log import FileStatusLog
from models.user import User
from sqlalchemy.orm import Session
from typing import Optional
from schemas.file import STATUS_TRANSITIONS, VALID_STATUSES


def validate_status_transition(from_status: str, to_status: str) -> bool:
    allowed = STATUS_TRANSITIONS.get(from_status, set())
    return to_status in allowed


def change_file_status(
    db: Session,
    file: File,
    to_status: str,
    changed_by_id: str,
    remarks: Optional[str] = None,
) -> FileStatusLog:
    if not validate_status_transition(file.status, to_status):
        raise ValueError(
            f"Cannot transition from '{file.status}' to '{to_status}'. "
            f"Allowed transitions: {STATUS_TRANSITIONS.get(file.status, set())}"
        )

    previous_status = file.status
    file.status = to_status
    if to_status == "closed":
        from datetime import date
        file.closed_date = date.today()
        if file.created_date:
            file.processing_days = (file.closed_date - file.created_date).days

    log = FileStatusLog(
        file_id=file.id,
        from_status=previous_status,
        to_status=to_status,
        changed_by=changed_by_id,
        remarks=remarks,
    )
    db.add(log)
    db.commit()
    db.refresh(file)
    return log
