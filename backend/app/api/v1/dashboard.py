"""
Dashboard Analytics API Endpoints
AI-Based Phishing Website Detection System
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.dashboard import DashboardStatsResponse
from backend.app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard Analytics"])


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """
    Retrieve real-time aggregated threat statistics, 7-day activity trends,
    risk category breakdown, and most frequent threat indicators.
    """
    return DashboardService.get_aggregated_stats(db=db)
