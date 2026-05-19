from models.file import File
from models.user import User
from models.assignment import EmployeeAssignment
from models.sla import SLAConfig
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from datetime import datetime, date
from typing import List, Dict, Any, Optional


def get_productivity_payload(db: Session) -> Dict[str, Any]:
    total = db.query(File).count()
    completed = db.query(File).filter(File.status == "closed").count()
    pending = db.query(File).filter(File.status != "closed").count()

    avg_days = None
    completed_files = db.query(File).filter(
        File.closed_date.isnot(None),
        File.created_date.isnot(None),
    ).all()
    if completed_files:
        avg_days = sum(
            (f.processing_days or 0) for f in completed_files
        ) / len(completed_files)

    section_breakdown = _compute_section_breakdown(db)
    employee_scores = _compute_employee_scores(db)
    underperforming = _detect_underperforming(db)
    old_pending = _find_old_pending(db)

    completion_rate = round((completed / total) * 100, 1) if total else 0

    insights = []
    insights.append(f"Completion rate stands at {completion_rate}% across {total} files.")
    if pending > completed:
        insights.append("Pending files exceed completed items — focus on backlog clearance.")
    if underperforming:
        sections_text = ", ".join([u["section"] for u in underperforming[:3]])
        insights.append(f"Sections needing attention: {sections_text}.")
    if avg_days and avg_days > 7:
        insights.append("Average processing time is above a week; review approval cycles.")

    return {
        "total_files": total,
        "completed": completed,
        "pending": pending,
        "avg_processing_time_days": round(avg_days, 1) if avg_days else None,
        "completion_rate": completion_rate,
        "section_breakdown": section_breakdown,
        "employee_scores": employee_scores,
        "underperforming_sections": underperforming,
        "old_pending_files": old_pending,
        "insights": insights,
        "llm_snapshot": None,
    }


def _compute_section_breakdown(db: Session) -> List[Dict]:
    sections = db.query(File.section, func.count(File.id)).group_by(File.section).all()
    result = []
    for section, total in sections:
        completed = db.query(File).filter(
            File.section == section, File.status == "closed"
        ).count()
        pending = total - completed
        avg_days = None
        completed_with_days = db.query(File).filter(
            File.section == section,
            File.processing_days.isnot(None),
        ).all()
        if completed_with_days:
            avg_days = sum(f.processing_days for f in completed_with_days) / len(completed_with_days)
        result.append({
            "section": section,
            "total": total,
            "completed": completed,
            "pending": pending,
            "avg_processing_days": round(avg_days, 1) if avg_days else None,
        })
    result.sort(key=lambda x: x["pending"], reverse=True)
    return result


def _compute_employee_scores(db: Session) -> List[Dict]:
    assignments = db.query(EmployeeAssignment).filter(
        EmployeeAssignment.unassigned_at.is_(None)
    ).all()
    if not assignments:
        return []

    employee_ids = set(a.employee_id for a in assignments)
    scores = []
    for emp_id in employee_ids:
        user = db.query(User).filter(User.id == emp_id).first()
        file_ids = db.query(EmployeeAssignment.file_id).filter(
            EmployeeAssignment.employee_id == emp_id,
            EmployeeAssignment.unassigned_at.is_(None),
        ).all()
        file_ids = [f[0] for f in file_ids]

        files = db.query(File).filter(File.id.in_(file_ids)).all()
        total = len(files)
        completed = sum(1 for f in files if f.status == "closed")
        pending = total - completed
        avg_days = None
        with_days = [f for f in files if f.processing_days]
        if with_days:
            avg_days = sum(f.processing_days for f in with_days) / len(with_days)
        score = round((completed * 1.5) - (pending * 0.5), 2)
        scores.append({
            "employee_id": emp_id,
            "employee_name": user.full_name or user.username if user else emp_id,
            "section": user.section if user else None,
            "total": total,
            "completed": completed,
            "pending": pending,
            "avg_processing_days": round(avg_days, 1) if avg_days else None,
            "productivity_score": score,
        })
    scores.sort(key=lambda x: x["productivity_score"], reverse=True)
    return scores


def _detect_underperforming(db: Session) -> List[Dict]:
    result = []
    sections = db.query(File.section, func.count(File.id)).group_by(File.section).all()
    for section, total in sections:
        sla = db.query(SLAConfig).filter(SLAConfig.section == section, SLAConfig.is_active == True).first()
        min_files = 3
        pending_ratio_threshold = sla.max_pending_ratio if sla else 0.4
        processing_days_threshold = sla.max_processing_days if sla else 10

        if total < min_files:
            continue

        pending = db.query(File).filter(
            File.section == section, File.status != "closed"
        ).count()
        completed = total - pending
        pending_ratio = pending / total if total else 0

        avg_days = None
        completed_files = db.query(File).filter(
            File.section == section, File.processing_days.isnot(None)
        ).all()
        if completed_files:
            avg_days = sum(f.processing_days for f in completed_files) / len(completed_files)

        reasons = []
        if pending_ratio > pending_ratio_threshold:
            reasons.append(f"High pending ratio ({pending_ratio:.0%})")
        if avg_days and avg_days > processing_days_threshold:
            reasons.append(f"High avg processing days ({avg_days:.1f})")

        if reasons:
            result.append({
                "section": section,
                "total": total,
                "completed": completed,
                "pending": pending,
                "pending_ratio": round(pending_ratio, 2),
                "avg_processing_days": round(avg_days, 1) if avg_days else None,
                "reasons": reasons,
            })

    result.sort(key=lambda x: x["pending"], reverse=True)
    return result


def _find_old_pending(db: Session, days_threshold: int = 14, limit: int = 10) -> List[Dict]:
    today = date.today()
    files = db.query(File).filter(File.status != "closed", File.created_date.isnot(None)).all()
    old = []
    for f in files:
        pending_days = (today - f.created_date).days
        if pending_days >= days_threshold:
            old.append({
                "file_no": f.file_no,
                "subject": f.subject,
                "section": f.section,
                "current_user": f.current_user,
                "pending_days": pending_days,
                "priority": f.priority,
                "due_date": f.due_date.isoformat() if f.due_date else None,
            })
    old.sort(key=lambda x: x["pending_days"], reverse=True)
    return old[:limit]


def get_employee_performance(db: Session) -> List[Dict]:
    employees = db.query(User).filter(User.role == "employee", User.is_active == True).all()
    results = []
    today = date.today()
    for emp in employees:
        assignments = db.query(EmployeeAssignment).filter(
            EmployeeAssignment.employee_id == emp.id,
            EmployeeAssignment.unassigned_at.is_(None)
        ).all()
        
        total_assigned = len(assignments)
        self_taken = sum(1 for a in assignments if a.assigned_by == emp.id)
        
        file_ids = [a.file_id for a in assignments]
        if not file_ids:
            results.append({
                "employee_id": emp.employee_id or emp.id,
                "username": emp.username,
                "full_name": emp.full_name or "",
                "section": emp.section or "",
                "total_assigned": 0,
                "self_taken": 0,
                "completed": 0,
                "in_progress": 0,
                "due_files": 0,
                "on_time_pct": 0,
                "score": 0,
                "tier": "Needs Improvement"
            })
            continue

        files = db.query(File).filter(File.id.in_(file_ids)).all()
        completed = sum(1 for f in files if f.status == "closed")
        in_progress = sum(1 for f in files if f.status == "in_progress")
        pending = len(files) - completed
        
        due_files = sum(1 for f in files if f.due_date and f.due_date < today and f.status != "closed")
        
        files_with_due_date = [f for f in files if f.due_date and f.status == "closed"]
        on_time = sum(1 for f in files_with_due_date if f.closed_date and f.closed_date <= f.due_date)
        on_time_pct = round((on_time / len(files_with_due_date)) * 100, 1) if files_with_due_date else 100.0

        score = round((completed * 1.5) - (pending * 0.5), 2)
        if score >= 10:
            tier = "Excellent"
        elif score >= 5:
            tier = "Good"
        else:
            tier = "Needs Improvement"
            
        results.append({
            "employee_id": emp.employee_id or emp.id,
            "username": emp.username,
            "full_name": emp.full_name or "",
            "section": emp.section or "",
            "total_assigned": total_assigned,
            "self_taken": self_taken,
            "completed": completed,
            "in_progress": in_progress,
            "due_files": due_files,
            "on_time_pct": on_time_pct,
            "score": score,
            "tier": tier
        })
        
    results.sort(key=lambda x: x["score"], reverse=True)
    return results


def get_monthly_trend(db: Session) -> List[Dict]:
    import calendar
    today = date.today()
    current_month = today.month
    current_year = today.year
    
    months = []
    for i in range(11, -1, -1):
        m = current_month - i
        y = current_year
        while m <= 0:
            m += 12
            y -= 1
        d = date(y, m, 1)
        month_label = f"{calendar.month_abbr[d.month]} {d.year}"
        months.append({"month": month_label, "intake": 0, "disposal": 0, "sort_key": d.strftime("%Y-%m")})
        
    month_dict = {m["sort_key"]: m for m in months}
    start_date_str = months[0]["sort_key"] + "-01"
    start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
    
    created_files = db.query(File).filter(File.created_date >= start_date).all()
    for f in created_files:
        key = f.created_date.strftime("%Y-%m")
        if key in month_dict:
            month_dict[key]["intake"] += 1
            
    closed_files = db.query(File).filter(File.closed_date >= start_date, File.status == "closed").all()
    for f in closed_files:
        if f.closed_date:
            key = f.closed_date.strftime("%Y-%m")
            if key in month_dict:
                month_dict[key]["disposal"] += 1
            
    return months
