"""
Database configuration for the Duolingo Clone backend.
Uses SQLite with SQLAlchemy ORM.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from typing import Generator

# ---------------------------------------------------------------------------
# Database URL – SQLite file path (uses /tmp on Vercel)
# ---------------------------------------------------------------------------

if os.getenv("VERCEL"):
    DB_PATH = "/tmp/duolingo_clone.db"
else:
    # Local development path
    DB_PATH = os.path.join(os.path.dirname(__file__), "..", "duolingo_clone.db")

# Use DB_PATH dynamically instead of hardcoding
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # Required for SQLite
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# ---------------------------------------------------------------------------
# Dependency injection helper – yields a DB session per request
# ---------------------------------------------------------------------------
def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that provides a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables defined by the ORM models (if they don't exist)."""
    from app import models  # noqa: F401 – import so Base knows about all tables
    Base.metadata.create_all(bind=engine)