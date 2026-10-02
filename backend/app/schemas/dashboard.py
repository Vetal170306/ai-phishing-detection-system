"""
Dashboard Analytics Pydantic Schemas
AI-Based Phishing Website Detection System
"""

from typing import Dict, List
from pydantic import BaseModel
from backend.app.schemas.scan import ScanHistoryItem


class RiskDistribution(BaseModel):
    legitimate: int
    suspicious: int
    phishing: int


class IndicatorStat(BaseModel):
    name: str
    count: int
    percentage: float


class DailyScanTrend(BaseModel):
    date: str
    legitimate: int
    suspicious: int
    phishing: int
    total: int


class DashboardStatsResponse(BaseModel):
    total_scans: int
    total_phishing: int
    total_suspicious: int
    total_legitimate: int
    phishing_rate: float
    average_risk_score: float
    risk_distribution: RiskDistribution
    top_indicators: List[IndicatorStat]
    scan_trends_7d: List[DailyScanTrend]
    recent_scans: List[ScanHistoryItem]
