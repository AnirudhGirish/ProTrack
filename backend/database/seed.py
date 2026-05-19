"""
Database initialisation: create all tables and seed required default data.

IMPORTANT: All model modules MUST be imported here before calling
Base.metadata.create_all() so that SQLAlchemy can discover every table.
Missing imports = missing tables on a fresh database.
"""
import logging
from database.connection import SessionLocal, engine, Base

# ── Import ALL models so SQLAlchemy registers every table ────────────────────
# Do NOT remove any of these imports — each one registers its table(s) with Base.metadata
from models.user import User          # noqa: F401  → users
from models.file import File          # noqa: F401  → files
from models.file_status_log import FileStatusLog  # noqa: F401  → file_status_log
from models.assignment import EmployeeAssignment  # noqa: F401  → employee_assignments
from models.audit import AuditLog     # noqa: F401  → audit_log
from models.notification import Notification  # noqa: F401  → notifications
from models.sla import SLAConfig      # noqa: F401  → sla_config
from models.chat import ChatSession, ChatMessage  # noqa: F401  → chat_sessions, chat_messages
from models.csv_import import CSVImport  # noqa: F401  → csv_imports
from models.section import Section       # noqa: F401  → sections

from services.auth_service import hash_password

logger = logging.getLogger(__name__)

DEFAULT_SECTIONS = [
    "Administration",
    "Accounts",
    "Wildlife & Environment",
    "Legal & Land",
    "Forest Management",
]


def create_tables() -> None:
    """Create all tables if they don't already exist.
    Safe to call on every startup — SQLAlchemy uses CREATE TABLE IF NOT EXISTS semantics.
    """
    try:
        logger.info("Creating database tables (if not exist)...")
        Base.metadata.create_all(bind=engine)
        logger.info(
            f"Tables registered: {list(Base.metadata.tables.keys())}"
        )
    except Exception as exc:
        logger.critical(
            f"FATAL: Failed to create database tables: {exc}. "
            "Check DATABASE_URL and database connectivity."
        )
        raise


def seed_database() -> None:
    """Seed required default data — idempotent, safe to call on every startup."""
    logger.info("Running database seed...")
    db = SessionLocal()
    try:
        # ── Default admin user ───────────────────────────────────────────────
        existing_admin = db.query(User).filter(User.username == "admin").first()
        if not existing_admin:
            admin = User(
                username="admin",
                password_hash=hash_password("admin123"),
                role="admin",
                full_name="System Administrator",
            )
            db.add(admin)
            logger.info("Created default admin user (username: admin / password: admin123)")
        else:
            logger.info("Default admin user already exists — skipping.")

        # ── Default SLA configs for standard sections ────────────────────────
        added_sections = set()
        for section in DEFAULT_SECTIONS:
            existing_sla = (
                db.query(SLAConfig).filter(SLAConfig.section == section).first()
            )
            if not existing_sla:
                db.add(SLAConfig(section=section))
                logger.info(f"Created default SLA config for section: {section}")

            existing_section = db.query(Section).filter(Section.name == section).first()
            if not existing_section and section not in added_sections:
                db.add(Section(name=section))
                added_sections.add(section)
                logger.info(f"Created default Section: {section}")
                
        # ── Seed from existing files (if any missing) ────────────────────────
        distinct_file_sections = db.query(File.section).distinct().all()
        for (sec_name,) in distinct_file_sections:
            if sec_name and sec_name not in added_sections:
                if not db.query(Section).filter(Section.name == sec_name).first():
                    db.add(Section(name=sec_name))
                    added_sections.add(sec_name)
                    logger.info(f"Created Section from existing file: {sec_name}")

        db.commit()
        logger.info("Database seeding complete.")

    except Exception as exc:
        db.rollback()
        logger.error(f"Database seeding failed: {exc}")
        raise
    finally:
        db.close()


def init_database() -> None:
    """Full startup init: create tables then seed defaults.
    Called from main.py on application startup.
    """
    create_tables()
    seed_database()
