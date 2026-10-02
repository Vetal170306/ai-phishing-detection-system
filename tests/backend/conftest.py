"""
Pytest Fixtures for Backend Testing
AI-Based Phishing Website Detection System
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.core.database import Base, get_db
from backend.app.core.security import create_access_token, get_password_hash
from backend.app.main import app
from backend.app.models.user import User

# In-memory SQLite engine for clean, fast test isolation
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Creates a fresh database schema for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient with overridden database dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session) -> User:
    """Creates and returns a standard test user."""
    user = User(
        name="Test Analyst",
        email="analyst@example.com",
        password_hash=get_password_hash("TestPass123!"),
        role="USER",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_admin(db_session) -> User:
    """Creates and returns an admin user."""
    admin = User(
        name="Admin Operator",
        email="admin@phishshield.internal",
        password_hash=get_password_hash("AdminPass123!"),
        role="ADMIN",
        is_active=True
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture
def user_auth_headers(test_user) -> dict:
    token = create_access_token({"sub": str(test_user.id), "role": test_user.role})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_auth_headers(test_admin) -> dict:
    token = create_access_token({"sub": str(test_admin.id), "role": test_admin.role})
    return {"Authorization": f"Bearer {token}"}
