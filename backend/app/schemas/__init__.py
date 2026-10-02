"""
Schemas module package
AI-Based Phishing Website Detection System
"""

from backend.app.schemas.auth import Token, TokenPayload, UserLogin, UserOut, UserRegister
from backend.app.schemas.dashboard import (
    DashboardStatsResponse,
    DailyScanTrend,
    IndicatorStat,
    RiskDistribution,
)
from backend.app.schemas.scan import (
    BatchScanRequest,
    BatchScanResponse,
    PaginatedScans,
    SafeIndicator,
    ScanFeaturesOut,
    ScanHistoryItem,
    ScanRequest,
    ScanResponse,
    WarningSign,
)

__all__ = [
    "UserRegister",
    "UserLogin",
    "UserOut",
    "Token",
    "TokenPayload",
    "ScanRequest",
    "BatchScanRequest",
    "WarningSign",
    "SafeIndicator",
    "ScanFeaturesOut",
    "ScanResponse",
    "BatchScanResponse",
    "ScanHistoryItem",
    "PaginatedScans",
    "DashboardStatsResponse",
    "DailyScanTrend",
    "IndicatorStat",
    "RiskDistribution",
]
