from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from database.connection import get_db
from models.user import User
from models.notification import Notification
from schemas.notification import NotificationResponse, NotificationCount
from services.notification_service import mark_as_read, mark_all_read, get_unread_count
from api.deps import get_current_user

router = APIRouter()


@router.get("")
async def list_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from utils.pagination import paginate
    query = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc())
    return paginate(query, page, page_size)


@router.get("/count", response_model=NotificationCount)
async def notification_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = db.query(Notification).filter(Notification.user_id == current_user.id).count()
    unread = get_unread_count(db, current_user.id)
    return NotificationCount(total=total, unread=unread)


@router.patch("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ok = mark_as_read(db, notification_id, current_user.id)
    if not ok:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Marked as read"}


@router.patch("/read-all")
async def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mark_all_read(db, current_user.id)
    return {"message": "All notifications marked as read"}
