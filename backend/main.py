from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from config import settings
from database.seed import init_database
from middleware.request_id import RequestIDMiddleware
from middleware.security_headers import SecurityHeadersMiddleware
from api.v1 import auth, files, productivity, employees, assignments, admin, chatbot, notifications
import logging

logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)


def create_app() -> FastAPI:
    app = FastAPI(
        title="Forest eOffice Productivity Monitoring",
        version="2.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
    )

    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    )
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    app.state.limiter = limiter

    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
        return JSONResponse(status_code=429, content={"error": {"code": "RATE_LIMITED", "message": "Too many requests. Please try again later."}})

    @app.on_event("startup")
    async def startup():
        logger.info("Initializing database...")
        init_database()
        logger.info("Application started.")

    @app.get("/api/health")
    async def health():
        return {"status": "ok", "version": "2.0.0"}

    app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
    app.include_router(files.router, prefix="/api/v1/files", tags=["Files"])
    app.include_router(productivity.router, prefix="/api/v1/productivity", tags=["Productivity"])
    app.include_router(employees.router, prefix="/api/v1/employee", tags=["Employee"])
    app.include_router(assignments.router, prefix="/api/v1/assignments", tags=["Assignments"])
    app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
    app.include_router(chatbot.router, prefix="/api/v1/chat", tags=["Chatbot"])
    app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])

    return app


app = create_app()
