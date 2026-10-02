"""
Scan API Endpoints
AI-Based Phishing Website Detection System
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from backend.app.api.deps import get_current_user, get_optional_current_user
from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.schemas.scan import (
    BatchScanRequest,
    BatchScanResponse,
    PaginatedScans,
    ScanRequest,
    ScanResponse,
)
from backend.app.services.scan_service import ScanService

router = APIRouter(prefix="/scans", tags=["URL Scans"])


@router.post("", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
def scan_url(
    scan_in: ScanRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Perform real-time static AI & heuristic phishing evaluation of a URL.
    Zero outbound network/HTTP requests for guaranteed safety against SSRF.
    """
    return ScanService.execute_scan(db=db, url=scan_in.url, user=current_user)


@router.post("/batch", response_model=BatchScanResponse, status_code=status.HTTP_200_OK)
def scan_batch_urls(
    batch_in: BatchScanRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Batch evaluate a list of up to 20 URLs simultaneously.
    """
    return ScanService.execute_batch_scan(db=db, urls=batch_in.urls, user=current_user)


@router.get("/history", response_model=PaginatedScans)
def get_scan_history(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=50, description="Items per page"),
    prediction: Optional[str] = Query(None, description="Filter by classification (LEGITIMATE, SUSPICIOUS, PHISHING)"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Retrieve paginated scan history. Returns user's scans if authenticated, or public scans.
    """
    user_id = current_user.id if current_user else None
    return ScanService.get_user_scan_history(
        db=db,
        user_id=user_id,
        page=page,
        page_size=page_size,
        prediction_filter=prediction
    )


@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan_detail(
    scan_id: int,
    db: Session = Depends(get_db)
):
    """
    Fetch comprehensive scan result breakdown, raw feature vector, and explainability badges by ID.
    """
    return ScanService.get_scan_by_id(db=db, scan_id=scan_id)
