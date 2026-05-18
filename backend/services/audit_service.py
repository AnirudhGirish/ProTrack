"""
Audit logging service.

All write operations are fire-and-forget: if the audit log write fails
(e.g., DB hiccup), the error is logged but the main operation is NOT rolled
back. Audit integrity is a reporting concern, not a transactional one.
"""
import json
import logging
from typing import Optional, Any
from models.audit import AuditLog
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def log_audit(
    db: Session,
    user_id: Optional[str],
    action: str,
    entity_type: str,
    entity_id: Optional[str] = None,
    old_value: Optional[Any] = None,
    new_value: Optional[Any] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> None:
    """Write an audit log entry.

    Serialises dict/list values to JSON strings before storage.
    Never raises — logs errors internally so callers are not disrupted.
    """
    try:
        entry = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            # Serialise any dict/list to a JSON string; non-serialisable types
            # fall back to str() via the default= argument.
            old_value=json.dumps(old_value, default=str) if old_value is not None else None,
            new_value=json.dumps(new_value, default=str) if new_value is not None else None,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        db.add(entry)
        db.commit()
    except Exception as exc:
        # Roll back only the audit entry — the session may still be usable
        try:
            db.rollback()
        except Exception:
            pass
        logger.error(
            f"Audit log write failed (action={action}, entity={entity_type}/{entity_id}): {exc}",
            exc_info=True,
        )
