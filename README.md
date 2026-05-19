# Forest eOffice Productivity Monitoring System

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-forest?style=for-the-badge&color=16a34a)
![Backend](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)
![Frontend](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Database](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)
![Deploy](https://img.shields.io/badge/Railway-Backend-0B0D0E?style=for-the-badge&logo=railway)
![Deploy](https://img.shields.io/badge/Vercel-Frontend-000000?style=for-the-badge&logo=vercel)
![AI](https://img.shields.io/badge/Gemini-2.5_Flash_Lite-4285F4?style=for-the-badge&logo=google)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

**An AI-powered, full-stack productivity analytics platform for the Karnataka Forest Department's digital file management ecosystem.**

[Live Demo](#) · [API Docs](#api-documentation) · [Report Bug](#contributing) · [Deployment Guide](#deployment)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Security](#security)
- [Roles & Permissions](#roles--permissions)
- [File Lifecycle](#file-lifecycle)
- [Contributing](#contributing)

---

## Overview

The **Forest eOffice Productivity Monitoring System** transforms the Karnataka Forest Department's raw e-Office workflow data into actionable performance intelligence. Built as an academic project at SDM College of Engineering & Technology, Dharwad (2025–26), the system bridges the gap identified in government digital governance literature: departments have digital file-tracking but lack real-time productivity scoring, visual analytics, and AI-assisted interpretation.

The system replaces a fragmented vanilla HTML + CSV + Flask prototype with a production-grade, security-hardened full-stack application deployable on cloud infrastructure.

### What Problem It Solves

| Legacy System | This System |
|---|---|
| CSV files as data store | PostgreSQL with full relational integrity |
| No authentication | JWT-based RBAC with 4 role levels |
| Manual performance reports | Live analytics dashboard with auto-scoring |
| No visibility into bottlenecks | Underperforming section detection with reasons |
| No task self-service | Employees self-assign and track files |
| No AI insights | Gemini LLM chatbot with full data context |

### 🚀 v2.0 Production Stabilization (Latest Updates)
- **Deployment Ready:** Full configuration for zero-downtime deployment using Vercel (Frontend SPA) and Railway (FastAPI Backend + PostgreSQL).
- **Advanced CSV Exporting:** Cross-browser compliant CSV generation utilizing `Blob` creation with FileSaver techniques, completely resolving Safari download blocking.
- **Robust DB Initialization:** In-memory deduplication during database seeding prevents `IntegrityError` collisions on startup.
- **Optimized AI Inference:** Switched to the lightning-fast `gemini-2.5-flash-lite` (Flash Lite) model to preserve tokens, reduce latency, and strictly output clean plain text (no markdown formatting).
- **Graceful Offline Mode:** The chatbot now proactively detects missing API keys or missing Python packages (`google-generativeai`) and falls back to a highly-formatted, descriptive offline analytics mode.
- **Safe Pagination:** Strict limits on paginated admin API endpoints to prevent integer overflow database failures.

---

## Key Features

### 🏛️ Government-Grade Security
- **JWT authentication** with HS256 signing, configurable expiry
- **bcrypt** password hashing (cost factor 12)
- **Role-Based Access Control** — 4 hierarchical roles
- **Rate limiting** via `slowapi` — configurable per endpoint
- **Security headers** — CSP, HSTS, X-Frame-Options, X-Content-Type on every response
- **CORS** whitelist — only named origins, never wildcard in production
- **Request ID tracing** on every request for audit correlation

### 📊 Productivity Analytics
- **Disposal rate** — completed files as % of total
- **Average turnaround time** — mean processing days per file
- **Pendency analysis** — section-wise and employee-wise backlog counts
- **Employee scoring** — `score = (completed × 1.5) − (pending × 0.5)`
- **Underperforming section detection** — configurable SLA thresholds with auto-flagging
- **Aged file alerts** — files pending beyond configurable day threshold

### 🤖 AI Chatbot (Gemini LLM)
- **Live data injection** — full section breakdown, employee leaderboard, aged files in every prompt
- **Multi-turn conversation** — history maintained per session
- **Role-aware responses** — admins get org-wide insights; employees get section-personalized answers
- **Graceful fallback** — rule-based responses if Gemini API is unavailable
- **Elaborated answers** — instructed to explain numbers, compare to averages, and recommend actions

### 👥 Role-Differentiated Experiences
- **Admin** — full productivity dashboard, file CRUD, user management, CSV import/export, employee assignment
- **Section Head** — same as admin but scoped to their section
- **Employee** — personal lite dashboard, self-service file take-up, status update workflow
- **Readonly** — analytics viewer, no mutations

### 📁 File Lifecycle Management
- **6-state FSM**: `received → in_progress → under_review → (approved | returned) → closed`
- **Status log** — every transition recorded with timestamp, actor, and remarks
- **Self-assignment** — employee takes up unassigned files in their section
- **Admin assignment** — assign any file to any active employee
- **SLA tracking** — per-section configurable day limits

### 📬 Notifications
- In-app notification system — file assigned, status changed, SLA breached
- Unread badge counter in navigation, real-time polling

---

## Tech Stack

### Backend
| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | FastAPI | 0.115.6 | Async REST API, OpenAPI docs |
| ORM | SQLAlchemy | 2.0.36 | Database abstraction, migrations |
| Database | PostgreSQL / SQLite | 16 / 3.x | Production / local development |
| Auth | python-jose + bcrypt | 3.3.0 / 4.0.1 | JWT signing + password hashing |
| Rate Limiting | slowapi | 0.1.9 | Per-endpoint request throttling |
| Validation | Pydantic v2 | 2.10.3 | Request/response schema validation |
| AI | google-generativeai | 0.8.3 | Gemini 1.5 Flash LLM integration |
| Server | Uvicorn | 0.34.0 | ASGI production server |
| Analytics | pandas + scikit-learn | 2.2.3 / 1.6.0 | Productivity metric computation |

### Frontend
| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | React | 18 | Component-based UI |
| Language | TypeScript | 5.x | Type-safe development |
| Build Tool | Vite | 8.x | Fast HMR + optimised production build |
| Styling | Tailwind CSS v4 | 4.x | Utility-first responsive design |
| HTTP Client | Axios | 1.x | API communication with interceptors |
| Charts | Recharts | 2.x | Section-wise bar charts, progress rings |
| Routing | React Router | 6.x | Client-side SPA routing |
| Notifications | react-hot-toast | 2.x | Non-blocking UI feedback |
| Icons | Lucide React | 0.x | Consistent icon system |

### Infrastructure
| Service | Platform | Purpose |
|---|---|---|
| Backend hosting | Railway | FastAPI + auto-deploy from GitHub |
| Database | Railway PostgreSQL | Managed PostgreSQL, auto-injected URL |
| Frontend hosting | Vercel | Global CDN, SPA routing via `vercel.json` |
| CI | GitHub → Railway/Vercel webhooks | Auto-deploy on push to `main` |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Client Browser                               │
│                  React 18 + TypeScript + Vite                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Dashboard   │  │  My Tasks    │  │  Admin Panel             │  │
│  │  (role-split)│  │  (self-svc)  │  │  (CRUD + assign)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│                   Axios + JWT Bearer token                           │
│                   VITE_API_URL → Railway                            │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ HTTPS
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Railway — FastAPI (Uvicorn)                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Middleware Stack                                           │   │
│  │  RequestID → SecurityHeaders → CORS → GZip → RateLimit     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌──────────┐ ┌────────────┐ ┌──────────────┐ ┌───────────────┐   │
│  │  /auth   │ │  /files    │ │ /productivity│ │  /employee    │   │
│  │  /admin  │ │ /assignments│ │  /chat       │ │/notifications │   │
│  └──────────┘ └────────────┘ └──────────────┘ └───────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Services: auth · file · productivity · audit · notification│   │
│  └─────────────────────────────────────────────────────────────┘   │
│                    SQLAlchemy ORM                                   │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
         ┌───────────────────────┼──────────────────────┐
         ▼                       ▼                      ▼
┌─────────────────┐   ┌─────────────────────┐  ┌───────────────┐
│Railway PostgreSQL│   │   Gemini 1.5 Flash  │  │ Railway Logs  │
│  10 tables      │   │   (Google AI API)   │  │  + Metrics    │
│  auto-migrated  │   │   Chatbot context   │  │               │
└─────────────────┘   └─────────────────────┘  └───────────────┘
```

---

## Project Structure

```
forest_eoffice_productivity/
├── backend/
│   ├── api/v1/                  # Route handlers (8 modules)
│   │   ├── auth.py              # Login, token refresh, /me
│   │   ├── files.py             # File CRUD + status transitions (RBAC)
│   │   ├── productivity.py      # Dashboard, section, employee analytics
│   │   ├── employees.py         # Employee summary, tasks, self-assign
│   │   ├── assignments.py       # Admin file→employee assignment
│   │   ├── admin.py             # User mgmt, CSV import/export, SLA config
│   │   ├── chatbot.py           # Gemini chat with live data context
│   │   └── notifications.py     # In-app notification delivery
│   ├── models/                  # SQLAlchemy ORM models (10 tables)
│   │   ├── user.py              # Users with role + section
│   │   ├── file.py              # Core file entity (FSM state)
│   │   ├── assignment.py        # File→employee assignment records
│   │   ├── file_status_log.py   # Immutable status transition audit
│   │   ├── audit.py             # Generic audit log (fire-and-forget)
│   │   ├── chat.py              # Chat sessions + messages
│   │   ├── notification.py      # In-app notifications
│   │   └── sla.py               # Per-section SLA configuration
│   ├── services/                # Business logic layer
│   │   ├── auth_service.py      # JWT create/verify
│   │   ├── file_service.py      # FSM transition validation
│   │   ├── productivity_service.py  # All metric computations
│   │   ├── audit_service.py     # Fire-and-forget audit logging
│   │   └── notification_service.py  # Notification creation
│   ├── middleware/
│   │   ├── request_id.py        # X-Request-ID on every response
│   │   └── security_headers.py  # CSP, HSTS, X-Frame-Options
│   ├── database/
│   │   ├── connection.py        # Engine + session factory (dialect-aware)
│   │   └── seed.py              # Auto-create tables on first boot
│   ├── schemas/                 # Pydantic v2 request/response models
│   ├── config.py                # Settings with env prefix FOREST_EOFFICE_
│   ├── main.py                  # App factory + middleware stack
│   ├── requirements.txt
│   ├── railway.toml             # Railway deploy config (Nixpacks)
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts        # Axios instance + JWT interceptor
│   │   │   └── endpoints.ts     # All typed API calls
│   │   ├── components/
│   │   │   ├── common/          # UIComponents (Card, StatCard, Table…)
│   │   │   ├── chat/            # FloatingChatbot with session history
│   │   │   └── layout/          # AppLayout (nav, footer)
│   │   ├── context/
│   │   │   └── AuthContext.tsx  # Global auth state + role
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx  # Public marketing page
│   │   │   ├── LoginPage.tsx    # JWT login form
│   │   │   ├── DashboardPage.tsx # Role-split: admin full / employee lite
│   │   │   ├── MyTasksPage.tsx  # My Files + Available in Section tabs
│   │   │   ├── AdminPage.tsx    # 4-tab admin panel
│   │   │   ├── NotificationsPage.tsx
│   │   │   └── docs/            # Privacy, Terms, Manuals, Security docs
│   │   ├── types/               # TypeScript interfaces
│   │   └── App.tsx              # Route definitions with ProtectedRoute
│   ├── vercel.json              # SPA fallback routing for Vercel
│   ├── vite.config.ts           # Code-splitting (5 vendor chunks)
│   └── tailwind.config.ts
│
├── .gitignore                   # Python + Node + OS + secrets
└── README.md
```

---

## Database Schema

```
users
  id, username, password_hash, role, section, employee_id,
  full_name, is_active, created_at, updated_at

files
  id, file_no (unique), subject, section, status (FSM),
  priority, initiated_by, current_user, assigned_to (→ users.id),
  created_date, closed_date, due_date, processing_days,
  movements, remarks, created_at, updated_at

employee_assignments
  id, employee_id (→ users.id), file_id (→ files.id),
  assigned_by (→ users.id), priority, notes,
  assigned_at, unassigned_at

file_status_logs                 # immutable audit trail
  id, file_id, from_status, to_status,
  changed_by (→ users.id), remarks, created_at

audit_logs                       # generic event log
  id, user_id, action, resource_type, resource_id,
  old_value (Text JSON), new_value (Text JSON), created_at

chat_sessions
  id, user_id (→ users.id), title, created_at, updated_at

chat_messages
  id, session_id (→ chat_sessions.id), role (user|assistant),
  content, llm_provider, tokens_used, response_time_ms, created_at

notifications
  id, user_id (→ users.id), type, title, body,
  entity_type, entity_id, read_at, created_at

sla_configs
  id, section, max_pending_days, max_pending_ratio,
  created_at, updated_at

csv_imports                      # import history
  id, filename, imported_by, rows_created, rows_updated,
  rows_failed, created_at
```

---

## API Reference

Base URL: `https://<your-backend>.railway.app/api/v1`
Interactive docs: `GET /api/docs` (Swagger UI)

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | — | Returns JWT access token |
| GET | `/auth/me` | ✅ | Current user profile |
| POST | `/auth/logout` | ✅ | Clears server-side session hint |

### Files
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/files` | ✅ | Paginated file list (role-scoped) |
| POST | `/files` | Admin | Create new file |
| PATCH | `/files/{id}` | Admin | Update file metadata |
| PATCH | `/files/{id}/status` | ✅ | FSM transition (validated) |
| DELETE | `/files/{id}` | Admin | Delete file |

### Employee
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/employee/summary` | ✅ | Personal stats (total, pending, completed) |
| GET | `/employee/tasks` | ✅ | Files assigned to me |
| GET | `/employee/section-files` | ✅ | Unassigned files in my section |
| POST | `/employee/self-assign/{file_id}` | ✅ | Take up a file |

### Assignments (Admin / Section Head)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/assignments` | Admin/SH | All active assignments |
| POST | `/assignments` | Admin/SH | Assign file to employee |
| POST | `/assignments/bulk` | Admin/SH | Bulk assign multiple files |
| DELETE | `/assignments/{id}` | Admin/SH | Unassign file |

### Productivity
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/productivity/dashboard` | ✅ | Full analytics payload |
| GET | `/productivity/sections` | ✅ | Section breakdown |
| GET | `/productivity/employees` | ✅ | Employee scores |
| GET | `/productivity/underperforming` | ✅ | Flagged sections |

### Admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/users` | Admin | Paginated user list |
| POST | `/admin/users` | Admin | Create user |
| PATCH | `/admin/users/{id}` | Admin | Update user |
| DELETE | `/admin/users/{id}` | Admin | Deactivate user |
| POST | `/admin/import-csv` | Admin | Bulk file import from CSV |
| GET | `/admin/export-csv` | Admin | Download all files as CSV |
| GET | `/admin/stats` | Admin | System-wide counts |
| GET | `/admin/audit-log` | Admin | Paginated audit trail |
| GET | `/admin/sla-config` | Admin | SLA thresholds per section |
| PATCH | `/admin/sla-config/{id}` | Admin | Update SLA thresholds |

### Chatbot
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/chat/message` | ✅ | Send message, get AI response |
| GET | `/chat/sessions` | ✅ | List user's chat sessions |
| GET | `/chat/sessions/{id}` | ✅ | Full message history |
| DELETE | `/chat/sessions/{id}` | ✅ | Delete session |

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20+
- Git

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set SECRET_KEY and GEMINI_API_KEY at minimum

# Start the development server (auto-creates SQLite DB + tables)
uvicorn main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/api/docs`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server (proxies /api → localhost:8000)
npm run dev
```

App available at: `http://localhost:5173`

### First Admin User

On first boot the database is auto-initialised. Create the admin user:

```bash
cd backend
python3 -c "
from database.connection import SessionLocal
from database.seed import init_database
from models.user import User
import bcrypt, uuid

init_database()
db = SessionLocal()
admin = User(
    id=str(uuid.uuid4()),
    username='admin',
    password_hash=bcrypt.hashpw(b'admin123', bcrypt.gensalt()).decode(),
    role='admin',
    full_name='System Administrator',
    is_active=True
)
db.add(admin)
db.commit()
db.close()
print('Done — login: admin / admin123')
"
```

> **Change the password immediately after first login.**

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `FOREST_EOFFICE_SECRET_KEY` | ✅ | — | 64-char hex string for JWT signing. Generate: `python3 -c "import secrets; print(secrets.token_hex(32))"` |
| `FOREST_EOFFICE_DATABASE_URL` | — | `sqlite:///./data/app.db` | PostgreSQL URL. On Railway, `DATABASE_URL` is injected automatically. |
| `FOREST_EOFFICE_CORS_ORIGINS_STR` | ✅ prod | `http://localhost:5173` | Comma-separated allowed origins. Set to your Vercel URL in production. |
| `FOREST_EOFFICE_GEMINI_API_KEY` | — | `""` | Google AI Studio API key. Falls back to rule-based chatbot if unset. |
| `FOREST_EOFFICE_RATE_LIMIT_LOGIN` | — | `5/minute` | Login endpoint rate limit |
| `FOREST_EOFFICE_RATE_LIMIT_GLOBAL` | — | `100/minute` | Global API rate limit |
| `FOREST_EOFFICE_ACCESS_TOKEN_EXPIRE_MINUTES` | — | `480` | JWT expiry (8 hours) |
| `FOREST_EOFFICE_LOG_LEVEL` | — | `INFO` | Python logging level |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | ✅ prod | falls back to `/api/v1` | Full Railway backend URL e.g. `https://your-app.up.railway.app/api/v1` |

---

## Deployment

### Backend → Railway

1. Push to GitHub
2. Railway → **New Project** → **Deploy from GitHub** → Root directory: `backend`
3. Add **PostgreSQL** plugin — `DATABASE_URL` is injected automatically
4. Set environment variables (all `FOREST_EOFFICE_*` vars)
5. Railway auto-runs: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Health check at `GET /api/health`

### Frontend → Vercel

1. Vercel → **New Project** → Import repo → Root directory: `frontend`
2. Framework: **Vite** | Build: `npm run build` | Output: `dist`
3. Add environment variable: `VITE_API_URL = https://your-app.up.railway.app/api/v1`
4. Deploy

**After Vercel deployment**, update Railway:
```
FOREST_EOFFICE_CORS_ORIGINS_STR = https://your-project.vercel.app
```

Full step-by-step guide: see `DEPLOYMENT.md`

---

## Security

### Authentication & Authorization
- **JWT HS256** tokens with configurable expiry (default 8h)
- Tokens stored in `localStorage`; cleared on 401 response
- Every protected endpoint uses `Depends(get_current_user)` via FastAPI dependency injection
- Role hierarchy: `admin > section_head > employee > readonly`
- Employees are hard-scoped to their section for file access

### Transport & Headers
Every response includes:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
X-Request-ID: <uuid>
```

### Data Protection
- Passwords hashed with `bcrypt` (never stored in plain text)
- SQL injection prevented via SQLAlchemy ORM parameterised queries
- XSS prevented by React's JSX escaping
- CSV exports use `csv.writer` (safe quoting, no formula injection)
- Rate limiting: 5 req/min on `/auth/login`, 100 req/min globally
- CORS whitelist — no wildcard origins in production

### Audit Trail
Every data-mutating operation writes to `audit_logs` with:
- `user_id` — who performed the action
- `action` — create, update, delete, assign, self_assign, status_change
- `old_value` / `new_value` — JSON diff
- Timestamp

---

## Roles & Permissions

| Action | Admin | Section Head | Employee | Readonly |
|---|---|---|---|---|
| Full org analytics dashboard | ✅ | ✅ | ❌ (lite view) | ✅ |
| Create / delete files | ✅ | ❌ | ❌ | ❌ |
| Assign files to employees | ✅ | ✅ | ❌ | ❌ |
| Self-assign section files | ❌ | ❌ | ✅ | ❌ |
| Update file status | ✅ | ✅ | ✅ (own files) | ❌ |
| Create / manage users | ✅ | ❌ | ❌ | ❌ |
| CSV import / export | ✅ | ❌ | ❌ | ❌ |
| View audit log | ✅ | ❌ | ❌ | ❌ |
| Configure SLA | ✅ | ❌ | ❌ | ❌ |
| Chatbot | ✅ | ✅ | ✅ | ✅ |

---

## File Lifecycle

```
                     ┌─────────┐
           Created → │received │
                     └────┬────┘
                          │ employee takes up / admin assigns
                     ┌────▼────────┐
                     │ in_progress │◄──────────────┐
                     └────┬────────┘               │
                          │ submitted for review    │ returned for revision
                     ┌────▼──────────┐             │
                     │ under_review  ├─────────────►│
                     └────┬────┬────┘             │
                   approved│    │returned          │
               ┌───────────┘    └─────────────────┘
          ┌────▼────┐
          │approved │
          └────┬────┘
               │ closed
          ┌────▼────┐
          │ closed  │ (terminal — processing_days recorded)
          └─────────┘
```

Each transition is:
1. Validated by the FSM (`file_service.validate_status_transition`)
2. Written to `file_status_logs` (immutable record)
3. Written to `audit_logs` (fire-and-forget, never crashes primary request)

---

## CSV Import Format

The admin CSV import accepts the following columns:

```
file_no, subject, section, priority, status, created_date
```

- `file_no` — required, unique identifier
- `priority` — `low` | `normal` | `high` | `critical`
- `status` — `received` | `in_progress` | `under_review` | `approved` | `returned` | `closed`
- `created_date` — ISO 8601 format (`YYYY-MM-DD`)

Duplicate `file_no` values trigger an **upsert** (existing records are updated, not duplicated).

---

## Contributing

This project was developed as an academic major project. Contributions for enhancement are welcome.

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/forest-eoffice.git

# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes, then commit
git commit -m "feat: description of change"

# Push and open a pull request
git push origin feature/your-feature-name
```

### Code Style
- **Backend**: PEP 8, type hints on all function signatures
- **Frontend**: ESLint + TypeScript strict mode, no `any` types where avoidable
- **Commits**: Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`)

---

## Work Context

| Item | Detail |
|---|---|
| Project Title | AI Enabled Productivity Analyzer for Government Offices |
| Case Study | Karnataka Forest Department (KFD) |

### Research Gap Addressed

Reviewed literature (2013–2022) showed government systems lacked the integrated combination of:
- Real-time productivity scoring
- Visual workload comparison dashboards
- Transparent employee evaluation
- AI-assisted natural language insights

This system delivers all four in a unified platform.

---

<div align="center">
Built by Anirudh Girish 

[anirudhgirish08@gmail.com](mailto:anirudhgirish08@gmail.com)

</div>