"""
Application Configuration Settings
AI-Based Phishing Website Detection System
"""

import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Based Phishing Website Detection System"
    API_V1_STR: str = "/api"
    
    # Security & JWT Token settings
    SECRET_KEY: str = "phishshield-super-secure-production-secret-key-change-in-env-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database connection string (SQLite dev / PostgreSQL prod)
    DATABASE_URL: str = "sqlite:///./phishing_detection.db"
    
    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Model Artifact Paths
    MODEL_PATH: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "ml",
        "phishing_model.joblib"
    )
    
    METRICS_PATH: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "ml",
        "model",
        "model_metrics.json"
    )

    model_config = SettingsConfigDict(env_file=".env", extra="allow")


settings = Settings()
