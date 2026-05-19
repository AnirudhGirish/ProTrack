from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Optional
from database.connection import get_db
from models.user import User
from models.chat import ChatSession, ChatMessage
from schemas.chatbot import ChatRequest, ChatResponse, ChatSessionResponse, ChatMessageResponse
from api.deps import get_current_user
from config import settings
from services.productivity_service import get_productivity_payload
import time
import logging
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()

_GEMINI_AVAILABLE = None
_gemini_model = None


def _get_gemini_model():
    global _GEMINI_AVAILABLE, _gemini_model
    if _GEMINI_AVAILABLE is not None:
        return _gemini_model
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-gemini-api-key-here":
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            _gemini_model = genai.GenerativeModel("gemini-2.5-flash-lite")
            _GEMINI_AVAILABLE = True
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {e}")
            _GEMINI_AVAILABLE = False
            _gemini_model = None
    else:
        _GEMINI_AVAILABLE = False
    return _gemini_model


def _build_system_prompt(productivity_data: dict, user_role: str = "employee", user_section: str = "") -> str:
    total = productivity_data.get('total_files', 0)
    completed = productivity_data.get('completed', 0)
    pending = productivity_data.get('pending', 0)
    rate = productivity_data.get('completion_rate', 0)
    avg_days = productivity_data.get('avg_processing_time_days', 'N/A')

    # Build section breakdown table
    sections = productivity_data.get('section_breakdown', [])
    section_table = ""
    if sections:
        section_table = "\n\nSECTION-WISE BREAKDOWN:\n"
        section_table += "| Section | Total | Completed | Pending | Avg Days |\n"
        section_table += "|---------|-------|-----------|---------|----------|\n"
        for s in sorted(sections, key=lambda x: x.get('pending', 0), reverse=True):
            section_table += f"| {s.get('section','?')} | {s.get('total',0)} | {s.get('completed',0)} | {s.get('pending',0)} | {s.get('avg_processing_days', 'N/A')} |\n"

    # Build employee leaderboard
    employees = productivity_data.get('employee_scores', [])
    emp_table = ""
    if employees:
        emp_table = "\n\nEMPLOYEE PRODUCTIVITY LEADERBOARD (top 10):\n"
        for i, e in enumerate(employees[:10], 1):
            emp_table += f"{i}. {e.get('employee_name','?')} — Score: {e.get('productivity_score',0)}, Completed: {e.get('completed',0)}/{e.get('total',0)}\n"

    # Build aged/overdue files list
    old_files = productivity_data.get('old_pending_files', [])
    aged_text = ""
    if old_files:
        aged_text = f"\n\nAGED/OVERDUE PENDING FILES ({len(old_files)} files pending >14 days):\n"
        for f in old_files[:10]:
            aged_text += f"- {f.get('file_no','?')} | Section: {f.get('section','?')} | Pending {f.get('pending_days',0)} days\n"

    # Underperforming sections
    underperforming = productivity_data.get('underperforming_sections', [])
    under_text = ""
    if underperforming:
        under_text = "\n\nFLAGGED UNDERPERFORMING SECTIONS:\n"
        for u in underperforming:
            under_text += f"- {u.get('section','?')}: {u.get('pending',0)}/{u.get('total',0)} pending. Reasons: {', '.join(u.get('reasons', []))}\n"

    # Personalization based on role
    if user_role == "employee" and user_section:
        role_context = f"\n\nThe user asking is an EMPLOYEE in the '{user_section}' section. Tailor your response to be relevant to their section when appropriate, but you have access to org-wide data for context."
    elif user_role in ("admin", "section_head"):
        role_context = "\n\nThe user asking is an ADMIN/SECTION HEAD with full visibility. Give org-wide insights and actionable management recommendations."
    else:
        role_context = ""

    return f"""You are an expert productivity analyst and AI assistant for the Karnataka Forest Department's Forest eOffice system.
You help administrators and employees understand file-processing performance, identify bottlenecks, and take corrective action.

Your responses must be:
- ELABORATED and EXPLANATORY — never give one-line answers. Explain what the numbers mean, why they matter, and what should be done.
- SPECIFIC — always mention section names, file numbers, employee names, and exact counts where relevant.
- ACTIONABLE — conclude with concrete recommendations whenever possible.
- PROFESSIONAL but accessible — avoid jargon; this system is used by government staff at all technical levels.
- CLEAN TEXT ONLY — DO NOT use any markdown formatting (no asterisks `**` or `*`, no hash `#` symbols). Provide purely clean, readable plain text.

CURRENT SYSTEM SNAPSHOT:
- Total Files in System: {total}
- Completed Files: {completed} ({rate}% completion rate)
- Pending Files: {pending}
- Average Processing Time: {avg_days} days per file
{section_table}{emp_table}{aged_text}{under_text}{role_context}

When asked about a section, explain its numbers and compare them to the org average.
When asked about an employee, explain their score relative to peers.
When asked about pending/overdue files, list specific file numbers and suggest escalation steps.
If the user asks something unrelated to this system, politely redirect them.
Always base your answers on the data provided above — do not invent numbers."""


@router.post("/message")
async def send_message(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session_id = data.session_id
    if session_id:
        session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
    else:
        title = data.query[:80] + ("..." if len(data.query) > 80 else "")
        session = ChatSession(user_id=current_user.id, title=title)
        db.add(session)
        db.commit()
        db.refresh(session)
        session_id = session.id

    user_msg = ChatMessage(session_id=session_id, role="user", content=data.query)
    db.add(user_msg)
    db.commit()

    productivity_data = get_productivity_payload(db)

    llm_provider = "none"
    tokens_used = 0
    response_time_ms = 0
    answer = ""

    model = _get_gemini_model()
    
    # Check if we should use Gemini
    gemini_error = None
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-gemini-api-key-here" and not _GEMINI_AVAILABLE:
        gemini_error = "google.generativeai module is missing. Please run: pip install google-generativeai"

    if model:
        try:
            start = time.time()
            # Fetch last 20 messages for conversation history (excluding the message we just added)
            history_msgs = db.query(ChatMessage).filter(
                ChatMessage.session_id == session_id
            ).order_by(ChatMessage.created_at.asc()).limit(20).all()

            # Build system prompt with full context + role-aware personalization
            system_prompt = _build_system_prompt(
                productivity_data,
                user_role=current_user.role,
                user_section=current_user.section or ""
            )

            # Build multi-turn conversation history for Gemini
            # Format: system prompt first, then alternating user/model turns
            gemini_contents = [system_prompt]
            for msg in history_msgs[:-1]:  # exclude the current user message (last one)
                if msg.role == "user":
                    gemini_contents.append(f"User: {msg.content}")
                elif msg.role == "assistant":
                    gemini_contents.append(f"Assistant: {msg.content}")
            # Add current query last
            gemini_contents.append(f"User: {data.query}")

            response = model.generate_content(gemini_contents)
            response_time_ms = int((time.time() - start) * 1000)
            answer = response.text if response.text else "I couldn't generate a response."
            tokens_used = response.usage_metadata.total_token_count if hasattr(response, 'usage_metadata') else 0
            llm_provider = "gemini"
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            answer = _fallback_response(data.query, productivity_data, error_msg=str(e))
            llm_provider = "fallback"
    else:
        answer = _fallback_response(data.query, productivity_data, error_msg=gemini_error)
        llm_provider = "fallback"

    assistant_msg = ChatMessage(
        session_id=session_id,
        role="assistant",
        content=answer,
        llm_provider=llm_provider,
        tokens_used=tokens_used,
        response_time_ms=response_time_ms,
    )
    db.add(assistant_msg)
    db.commit()

    session.updated_at = datetime.utcnow()
    db.commit()

    return {
        "answer": answer,
        "session_id": session_id,
        "summary": {"total_files": productivity_data["total_files"], "completed": productivity_data["completed"], "pending": productivity_data["pending"]},
        "section_summary": {s["section"]: {"total": s["total"], "completed": s["completed"], "pending": s["pending"]} for s in productivity_data["section_breakdown"]},
        "underperforming": productivity_data["underperforming_sections"],
        "old_pending_files": productivity_data["old_pending_files"],
        "suggestions": [],
        "evidence_count": 0,
        "evidence": [],
    }


def _fallback_response(query: str, data: dict, error_msg: str = None) -> str:
    q = query.lower()
    
    if error_msg:
        prefix = f"**[Offline Mode]** *I am operating in fallback mode due to a Gemini Error: {error_msg}*\n\n"
    else:
        prefix = "**[Offline Mode]** *I am operating in fallback mode because no Gemini API key is configured in the `.env` file. For advanced analysis, please configure the API key.*\n\n"
    
    if "productivity" in q or "summary" in q or "status" in q:
        return (f"{prefix}Here is the current productivity summary for the department:\n\n"
                f"We currently have a total of **{data['total_files']} files** registered in the system. Out of these, **{data['completed']}** have been successfully processed and closed, resulting in a **completion rate of {data['completion_rate']}%**.\n\n"
                f"There are **{data['pending']} files** currently pending action. The overall average processing time is **{data.get('avg_processing_time_days', 'N/A')} days** per file.")
                
    if "pending" in q or "old" in q or "overdue" in q:
        old = data.get("old_pending_files", [])
        if old:
            response = f"{prefix}I found **{len(old)} files** that have been pending for more than 14 days and require immediate attention.\n\nHere are the top most overdue files:\n"
            for f in old[:5]:
                response += f"- **File No:** {f['file_no']} (Section: {f['section']}) — Pending for **{f['pending_days']} days**.\n"
            response += "\nI highly recommend escalating these to the respective Section Heads immediately to avoid further delays."
            return response
        return f"{prefix}Great news! There are currently no files pending beyond the 14-day overdue threshold."
        
    if "section" in q:
        sections = data.get("section_breakdown", [])
        if sections:
            top = sorted(sections, key=lambda s: s["pending"], reverse=True)[:3]
            response = f"{prefix}Here is the breakdown of the most burdened sections based on their pending file volume:\n\n"
            for s in top:
                response += f"- **{s['section']}**: Has {s['pending']} files pending out of a total {s['total']} handled (Completed: {s['completed']}).\n"
            response += "\nThese sections might need additional resources or immediate review of their workflow."
            return response
        return f"{prefix}I'm sorry, but I don't have enough data to provide a section breakdown right now."
        
    return (f"{prefix}I am an automated assistant. As of now, the system has **{data['total_files']} files** with a **{data['completion_rate']}%** completion rate.\n\n"
            f"Since I am operating in basic fallback mode, I can only answer simple queries about:\n"
            f"- **Productivity summary** (e.g., 'What is our status?')\n"
            f"- **Section performance** (e.g., 'Show section breakdown')\n"
            f"- **Overdue files** (e.g., 'Are there old pending files?')\n\n"
            f"Please configure the Gemini API key to enable my advanced analytics and natural conversation features!")


@router.get("/sessions")
async def list_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.updated_at.desc()).all()

    result = []
    for s in sessions:
        msg_count = db.query(ChatMessage).filter(ChatMessage.session_id == s.id).count()
        result.append(ChatSessionResponse(id=s.id, title=s.title, created_at=s.created_at, updated_at=s.updated_at, message_count=msg_count))
    return result


@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).all()
    return [ChatMessageResponse.model_validate(m) for m in messages]


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    db.delete(session)
    db.commit()
    return {"message": "Chat session deleted"}
