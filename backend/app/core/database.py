"""
SQLAlchemy Database Connection & Session Management
AI-Based Phishing Website Detection System
"""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from backend.app.core.config import settings

# Configure SQLite check_same_thread argument if using SQLite
is_sqlite = settings.DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator:
    """
    FastAPI dependency yielding a thread-local database session,
    guaranteeing automatic rollback on error and proper closure.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
