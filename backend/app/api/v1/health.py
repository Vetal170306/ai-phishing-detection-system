"""
System Health API Endpoints
AI-Based Phishing Website Detection System
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.app.core.database import get_db
from backend.app.ml.predictor import predictor

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Service health verification endpoint: checks database connection and ML model readiness.
    """
    db_status = "HEALTHY"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"UNHEALTHY: {str(e)}"

    ml_status = "LOADED" if predictor.model is not None else "DEGRADED_HEURISTIC"

    return {
        "status": "ONLINE" if db_status == "HEALTHY" else "DEGRADED",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": db_status,
        "ml_inference_engine": ml_status,
        "version": "1.0.0"
    }
