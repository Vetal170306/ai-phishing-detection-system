"""
Authentication Service Layer
AI-Based Phishing Website Detection System
"""

from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.security import create_access_token, get_password_hash, verify_password
from backend.app.models.user import User
from backend.app.schemas.auth import Token, UserLogin, UserOut, UserRegister


class AuthService:

    @staticmethod
    def register_user(db: Session, user_in: UserRegister) -> Token:
        # Check if email is already taken
        existing_user = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )

        hashed_password = get_password_hash(user_in.password)
        db_user = User(
            name=user_in.name.strip(),
            email=user_in.email.lower().strip(),
            password_hash=hashed_password,
            role="USER",
            is_active=True
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        token_data = {"sub": str(db_user.id), "role": db_user.role, "email": db_user.email}
        token = create_access_token(data=token_data)

        return Token(
            access_token=token,
            token_type="bearer",
            user=UserOut.model_validate(db_user)
        )

    @staticmethod
    def authenticate_user(db: Session, credentials: UserLogin) -> Token:
        user = db.query(User).filter(User.email == credentials.email.lower().strip()).first()
        if not user or not verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
                headers={"WWW-Authenticate": "Bearer"}
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated. Please contact support."
            )

        token_data = {"sub": str(user.id), "role": user.role, "email": user.email}
        token = create_access_token(data=token_data)

        return Token(
            access_token=token,
            token_type="bearer",
            user=UserOut.model_validate(user)
        )
