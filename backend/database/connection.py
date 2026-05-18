from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from config import settings
import os
import logging

logger = logging.getLogger(__name__)

# ── Resolve DATABASE_URL ─────────────────────────────────────────────────────
# Priority: env var DATABASE_URL (set by Railway) > prefixed env var > config default
raw_url = (
    os.environ.get("DATABASE_URL")
    or os.environ.get("FOREST_EOFFICE_DATABASE_URL")
    or settings.DATABASE_URL
)

# Normalise all postgres:// / postgres+psycopg2:// variants to postgresql://
def _normalise_db_url(url: str) -> str:
    replacements = [
        ("postgres://", "postgresql://"),
        ("postgres+psycopg2://", "postgresql+psycopg2://"),
        ("postgres+asyncpg://", "postgresql+asyncpg://"),
    ]
    for old, new in replacements:
        if url.startswith(old):
            url = new + url[len(old):]
            break
    return url

db_url = _normalise_db_url(raw_url)

# For SQLite: resolve relative paths relative to a stable data directory
if "sqlite" in db_url:
    DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(DATA_DIR, exist_ok=True)
    db_path = db_url.replace("sqlite:///", "")
    if not os.path.isabs(db_path):
        db_url = f"sqlite:///{os.path.join(DATA_DIR, os.path.basename(db_path))}"

IS_SQLITE = "sqlite" in db_url

logger.info(f"Database engine: {'SQLite' if IS_SQLITE else 'PostgreSQL'}")

# ── Engine — dialect-aware settings ─────────────────────────────────────────
if IS_SQLITE:
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        echo=False,
    )
else:
    engine = create_engine(
        db_url,
        pool_size=10,           # maintain up to 10 persistent connections
        max_overflow=20,        # allow 20 extra connections at peak load
        pool_timeout=30,        # wait up to 30s for a connection before error
        pool_recycle=1800,      # recycle connections after 30 min (prevents stale connections)
        pool_pre_ping=True,     # verify connection is alive before using it
        echo=False,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
