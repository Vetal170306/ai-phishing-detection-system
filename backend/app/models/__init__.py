"""
SQLAlchemy Models Export
AI-Based Phishing Website Detection System
"""

from backend.app.models.user import User
from backend.app.models.model_version import ModelVersion
from backend.app.models.scan import Scan, ScanFeature

__all__ = ["User", "ModelVersion", "Scan", "ScanFeature"]
