"""
Scan Service Layer
AI-Based Phishing Website Detection System
"""

import math
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.ml.predictor import predictor
from backend.app.models.model_version import ModelVersion
from backend.app.models.scan import Scan, ScanFeature
from backend.app.models.user import User
from backend.app.schemas.scan import (
    BatchScanResponse,
    PaginatedScans,
    SafeIndicator,
    ScanHistoryItem,
    ScanResponse,
    WarningSign,
)


class ScanService:

    @staticmethod
    def execute_scan(
        db: Session,
        url: str,
        user: Optional[User] = None
    ) -> ScanResponse:
        url_clean = url.strip()
        if not url_clean:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="URL cannot be empty."
            )

        # Execute static ML inference & explainability engine
        try:
            pred_result = predictor.predict(url_clean)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error executing security analysis: {str(e)}"
            )

        features = pred_result["features"]

        # Find active model version ID if exists
        active_model = db.query(ModelVersion).filter(ModelVersion.is_active == True).first()
        model_version_id = active_model.id if active_model else None

        # Persist scan to database
        db_scan = Scan(
            user_id=user.id if user else None,
            model_version_id=model_version_id,
            url=pred_result["url"],
            normalized_url=pred_result["normalized_url"],
            prediction=pred_result["prediction"],
            confidence=pred_result["confidence"],
            risk_score=pred_result["risk_score"],
            risk_level=pred_result["risk_level"]
        )
        db.add(db_scan)
        db.flush()

        # Persist static extracted features
        db_features = ScanFeature(
            scan_id=db_scan.id,
            url_length=features["url_length"],
            domain_length=features["domain_length"],
            subdomain_count=features["subdomain_count"],
            dot_count=features["dot_count"],
            hyphen_count=features["hyphen_count"],
            digit_count=features["digit_count"],
            special_character_count=features["special_character_count"],
            has_ip=bool(features["has_ip"]),
            has_https=bool(features["has_https"]),
            has_at_symbol=bool(features["has_at_symbol"]),
            suspicious_keyword_count=features["suspicious_keyword_count"],
            url_shortener_detected=bool(features["url_shortener_detected"]),
            parameter_count=features["parameter_count"],
            path_segment_count=features["path_segment_count"],
            domain_entropy=features["domain_entropy"],
            digit_ratio=features["digit_ratio"]
        )
        db.add(db_features)
        db.commit()
        db.refresh(db_scan)

        return ScanResponse(
            id=db_scan.id,
            url=db_scan.url,
            normalized_url=db_scan.normalized_url,
            prediction=db_scan.prediction,
            risk_score=db_scan.risk_score,
            risk_level=db_scan.risk_level,
            confidence=db_scan.confidence,
            phishing_probability=pred_result["phishing_probability"],
            algorithm=pred_result["algorithm"],
            model_version=pred_result["model_version"],
            features=features,
            warning_signs=[WarningSign(**w) for w in pred_result["warning_signs"]],
            safe_indicators=[SafeIndicator(**s) for s in pred_result["safe_indicators"]],
            created_at=db_scan.created_at
        )

    @staticmethod
    def execute_batch_scan(
        db: Session,
        urls: List[str],
        user: Optional[User] = None
    ) -> BatchScanResponse:
        results: List[ScanResponse] = []
        phishing_count = 0
        suspicious_count = 0
        legitimate_count = 0

        for raw_url in urls:
            cleaned = raw_url.strip()
            if not cleaned:
                continue
            res = ScanService.execute_scan(db, cleaned, user=user)
            results.append(res)
            if res.prediction == "PHISHING":
                phishing_count += 1
            elif res.prediction == "SUSPICIOUS":
                suspicious_count += 1
            else:
                legitimate_count += 1

        return BatchScanResponse(
            total_scanned=len(results),
            phishing_detected=phishing_count,
            suspicious_detected=suspicious_count,
            legitimate_detected=legitimate_count,
            results=results
        )

    @staticmethod
    def get_user_scan_history(
        db: Session,
        user_id: Optional[int],
        page: int = 1,
        page_size: int = 10,
        prediction_filter: Optional[str] = None
    ) -> PaginatedScans:
        query = db.query(Scan)
        if user_id:
            query = query.filter(Scan.user_id == user_id)
        
        if prediction_filter and prediction_filter.upper() in ["LEGITIMATE", "SUSPICIOUS", "PHISHING"]:
            query = query.filter(Scan.prediction == prediction_filter.upper())

        total = query.count()
        total_pages = max(1, math.ceil(total / page_size))
        
        offset = (page - 1) * page_size
        items = query.order_by(desc(Scan.created_at)).offset(offset).limit(page_size).all()

        return PaginatedScans(
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            items=[ScanHistoryItem.model_validate(item) for item in items]
        )

    @staticmethod
    def get_scan_by_id(db: Session, scan_id: int) -> ScanResponse:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scan with ID #{scan_id} not found."
            )

        # Generate live explanations
        pred_result = predictor.predict(scan.url)
        return ScanResponse(
            id=scan.id,
            url=scan.url,
            normalized_url=scan.normalized_url,
            prediction=scan.prediction,
            risk_score=scan.risk_score,
            risk_level=scan.risk_level,
            confidence=scan.confidence,
            phishing_probability=pred_result["phishing_probability"],
            algorithm=pred_result["algorithm"],
            model_version=pred_result["model_version"],
            features=pred_result["features"],
            warning_signs=[WarningSign(**w) for w in pred_result["warning_signs"]],
            safe_indicators=[SafeIndicator(**s) for s in pred_result["safe_indicators"]],
            created_at=scan.created_at
        )
