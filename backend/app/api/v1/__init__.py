"""
API v1 Router aggregation
AI-Based Phishing Website Detection System
"""

from fastapi import APIRouter

from backend.app.api.v1.admin import router as admin_router
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.dashboard import router as dashboard_router
from backend.app.api.v1.health import router as health_router
from backend.app.api.v1.scans import router as scans_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(scans_router)
api_v1_router.include_router(dashboard_router)
api_v1_router.include_router(admin_router)
