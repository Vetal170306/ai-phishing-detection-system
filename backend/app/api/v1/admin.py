"""
Admin Management API Endpoints
AI-Based Phishing Website Detection System
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.api.deps import get_current_active_admin
from backend.app.core.database import get_db
from backend.app.ml.predictor import predictor
from backend.app.models.model_version import ModelVersion
from backend.app.models.user import User
from backend.app.schemas.auth import UserOut

router = APIRouter(prefix="/admin", tags=["Admin Management"], dependencies=[Depends(get_current_active_admin)])


@router.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db)):
    """
    List registered platform users (Administrator only).
    """
    return db.query(User).order_by(User.id.desc()).all()


@router.get("/model-status")
def get_model_status(db: Session = Depends(get_db)):
    """
    Get current machine learning model operational status and metadata.
    """
    active_model = db.query(ModelVersion).filter(ModelVersion.is_active == True).first()
    return {
        "status": "OPERATIONAL" if predictor.model is not None else "FALLBACK_HEURISTIC",
        "algorithm": predictor.algorithm,
        "version": predictor.version,
        "active_database_model": {
            "version_tag": active_model.version_tag if active_model else "v1.0.0",
            "accuracy": active_model.accuracy if active_model else 0.99,
            "f1_score": active_model.f1_score if active_model else 0.99,
            "training_samples": active_model.training_samples if active_model else 235795
        } if active_model else None
    }


@router.patch("/users/{user_id}/toggle-status")
def toggle_user_active_status(user_id: int, db: Session = Depends(get_db)):
    """
    Toggle user active / suspended status.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {user.email} is now {'active' if user.is_active else 'suspended'}"}
