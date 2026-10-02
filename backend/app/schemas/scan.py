"""
Scan Request, Response & History Pydantic Schemas
AI-Based Phishing Website Detection System
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ScanRequest(BaseModel):
    url: str = Field(..., min_length=3, max_length=2048, json_schema_extra={"example": "https://secure-login.bank-update.xyz/auth"})


class BatchScanRequest(BaseModel):
    urls: List[str] = Field(..., min_length=1, max_length=20, json_schema_extra={"example": ["https://example.com", "http://192.168.1.1/login"]})


class WarningSign(BaseModel):
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    title: str
    description: str


class SafeIndicator(BaseModel):
    title: str
    description: str


class ScanFeaturesOut(BaseModel):
    url_length: int
    domain_length: int
    subdomain_count: int
    dot_count: int
    hyphen_count: int
    digit_count: int
    special_character_count: int
    has_ip: bool
    has_https: bool
    has_at_symbol: bool
    suspicious_keyword_count: int
    url_shortener_detected: bool
    parameter_count: int
    path_segment_count: int
    domain_entropy: float
    digit_ratio: float

    model_config = ConfigDict(from_attributes=True)


class ScanResponse(BaseModel):
    id: Optional[int] = None
    url: str
    normalized_url: str
    prediction: str  # LEGITIMATE, SUSPICIOUS, PHISHING
    risk_score: int  # 0 to 100
    risk_level: str  # LOW, MEDIUM, HIGH
    confidence: float
    phishing_probability: float
    algorithm: Optional[str] = None
    model_version: Optional[str] = None
    features: Dict[str, Any]
    warning_signs: List[WarningSign] = []
    safe_indicators: List[SafeIndicator] = []
    created_at: Optional[datetime] = None


class BatchScanResponse(BaseModel):
    total_scanned: int
    phishing_detected: int
    suspicious_detected: int
    legitimate_detected: int
    results: List[ScanResponse]


class ScanHistoryItem(BaseModel):
    id: int
    url: str
    normalized_url: str
    prediction: str
    risk_score: int
    risk_level: str
    confidence: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedScans(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[ScanHistoryItem]
