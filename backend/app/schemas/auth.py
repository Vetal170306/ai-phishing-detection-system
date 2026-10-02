"""
Authentication & User Pydantic Schemas
AI-Based Phishing Website Detection System
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, json_schema_extra={"example": "John Doe"})
    email: EmailStr = Field(..., json_schema_extra={"example": "john@example.com"})
    password: str = Field(..., min_length=6, max_length=100, json_schema_extra={"example": "SecurePass123!"})


class UserLogin(BaseModel):
    email: EmailStr = Field(..., json_schema_extra={"example": "john@example.com"})
    password: str = Field(..., json_schema_extra={"example": "SecurePass123!"})


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = "USER"
    exp: Optional[int] = None
