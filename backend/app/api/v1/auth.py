"""
Authentication API Endpoints
AI-Based Phishing Website Detection System
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.api.deps import get_current_user
from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.schemas.auth import Token, UserLogin, UserOut, UserRegister
from backend.app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user account with secure Argon2id password hashing and return JWT bearer token.
    """
    return AuthService.register_user(db=db, user_in=user_in)


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user credentials and issue signed JWT bearer access token.
    """
    return AuthService.authenticate_user(db=db, credentials=credentials)


@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Fetch authenticated user's profile information.
    """
    return current_user
