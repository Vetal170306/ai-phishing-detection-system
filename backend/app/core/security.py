"""
Security & Cryptography Utilities
AI-Based Phishing Website Detection System

Implements Argon2id password hashing and JWT token issuance / verification.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import jwt

from backend.app.core.config import settings

ph = PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=4,
    hash_len=32,
    salt_len=16
)


def get_password_hash(password: str) -> str:
    """Hashes a plaintext password using Argon2id."""
    return ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plaintext password against an Argon2id hash."""
    try:
        return ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, Exception):
        return False


def create_access_token(
    subject: Optional[Union[str, int, Dict[str, Any]]] = None,
    role: str = "USER",
    expires_delta: Optional[timedelta] = None,
    data: Optional[Dict[str, Any]] = None
) -> str:
    """Issues a signed JWT access token."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode: Dict[str, Any] = {
        "exp": expire,
        "iat": now,
    }

    if isinstance(subject, dict):
        to_encode.update(subject)
    elif subject is not None:
        to_encode["sub"] = str(subject)

    if data:
        to_encode.update(data)
        
    if "role" not in to_encode:
        to_encode["role"] = role

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates a JWT access token, returning its payload or None."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
