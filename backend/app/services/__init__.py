"""
Services Package
AI-Based Phishing Website Detection System
"""

from backend.app.services.auth_service import AuthService
from backend.app.services.dashboard_service import DashboardService
from backend.app.services.scan_service import ScanService

__all__ = ["AuthService", "ScanService", "DashboardService"]
