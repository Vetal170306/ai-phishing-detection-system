"""
ModelVersion SQLAlchemy ORM Model
AI-Based Phishing Website Detection System
"""

from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String
from sqlalchemy.orm import relationship

from backend.app.core.database import Base


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    model_name = Column(String(100), nullable=False)
    version = Column(String(50), unique=True, nullable=False)
    algorithm = Column(String(100), nullable=False)
    accuracy = Column(Float, nullable=True)
    precision_score = Column(Float, nullable=True)
    recall_score = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    scans = relationship("Scan", back_populates="model_version", foreign_keys="Scan.model_version_id")

    def __repr__(self):
        return f"<ModelVersion id={self.id} version='{self.version}' algorithm='{self.algorithm}'>"
