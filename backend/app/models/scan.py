"""
Scan & ScanFeature SQLAlchemy ORM Models
AI-Based Phishing Website Detection System
"""

from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from backend.app.core.database import Base


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    model_version_id = Column(Integer, ForeignKey("model_versions.id", ondelete="SET NULL"), nullable=True)
    url = Column(Text, nullable=False)
    normalized_url = Column(Text, nullable=False)
    prediction = Column(String(20), nullable=False, index=True)  # LEGITIMATE, SUSPICIOUS, PHISHING
    confidence = Column(Float, nullable=False)
    risk_score = Column(Integer, nullable=False)  # 0 to 100
    risk_level = Column(String(20), nullable=False)  # LOW, MEDIUM, HIGH
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    user = relationship("User", back_populates="scans")
    model_version = relationship("ModelVersion", back_populates="scans")
    features = relationship("ScanFeature", back_populates="scan", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Scan id={self.id} prediction='{self.prediction}' risk={self.risk_score}>"


class ScanFeature(Base):
    __tablename__ = "scan_features"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    scan_id = Column(Integer, ForeignKey("scans.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    url_length = Column(Integer, nullable=False)
    domain_length = Column(Integer, nullable=False)
    subdomain_count = Column(Integer, nullable=False)
    dot_count = Column(Integer, nullable=False)
    hyphen_count = Column(Integer, nullable=False)
    digit_count = Column(Integer, nullable=False)
    special_character_count = Column(Integer, nullable=False)
    has_ip = Column(Boolean, nullable=False, default=False)
    has_https = Column(Boolean, nullable=False, default=False)
    has_at_symbol = Column(Boolean, nullable=False, default=False)
    suspicious_keyword_count = Column(Integer, nullable=False, default=0)
    url_shortener_detected = Column(Boolean, nullable=False, default=False)
    parameter_count = Column(Integer, nullable=False, default=0)
    path_segment_count = Column(Integer, nullable=False, default=0)
    domain_entropy = Column(Float, nullable=False, default=0.0)
    digit_ratio = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    scan = relationship("Scan", back_populates="features")

    def __repr__(self):
        return f"<ScanFeature id={self.id} scan_id={self.scan_id}>"
