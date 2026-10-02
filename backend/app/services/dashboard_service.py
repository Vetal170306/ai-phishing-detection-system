"""
Dashboard Analytics Service Layer
AI-Based Phishing Website Detection System
"""

from datetime import datetime, timedelta, timezone
from typing import List
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from backend.app.models.scan import Scan, ScanFeature
from backend.app.schemas.dashboard import (
    DailyScanTrend,
    DashboardStatsResponse,
    IndicatorStat,
    RiskDistribution,
)
from backend.app.schemas.scan import ScanHistoryItem


class DashboardService:

    @staticmethod
    def get_aggregated_stats(db: Session) -> DashboardStatsResponse:
        total_scans = db.query(func.count(Scan.id)).scalar() or 0
        
        phishing_count = db.query(func.count(Scan.id)).filter(Scan.prediction == "PHISHING").scalar() or 0
        suspicious_count = db.query(func.count(Scan.id)).filter(Scan.prediction == "SUSPICIOUS").scalar() or 0
        legitimate_count = db.query(func.count(Scan.id)).filter(Scan.prediction == "LEGITIMATE").scalar() or 0

        phishing_rate = round((phishing_count / total_scans * 100), 2) if total_scans > 0 else 0.0
        avg_risk = db.query(func.avg(Scan.risk_score)).scalar() or 0.0
        avg_risk = round(float(avg_risk), 1)

        # Risk distribution
        risk_dist = RiskDistribution(
            legitimate=legitimate_count,
            suspicious=suspicious_count,
            phishing=phishing_count
        )

        # Indicator analysis
        total_features = db.query(func.count(ScanFeature.id)).scalar() or 0
        top_indicators: List[IndicatorStat] = []
        if total_features > 0:
            ip_count = db.query(func.count(ScanFeature.id)).filter(ScanFeature.has_ip == True).scalar() or 0
            no_https_count = db.query(func.count(ScanFeature.id)).filter(ScanFeature.has_https == False).scalar() or 0
            at_count = db.query(func.count(ScanFeature.id)).filter(ScanFeature.has_at_symbol == True).scalar() or 0
            kw_count = db.query(func.count(ScanFeature.id)).filter(ScanFeature.suspicious_keyword_count > 0).scalar() or 0
            shortener_count = db.query(func.count(ScanFeature.id)).filter(ScanFeature.url_shortener_detected == True).scalar() or 0
            subdomain_count = db.query(func.count(ScanFeature.id)).filter(ScanFeature.subdomain_count >= 3).scalar() or 0

            indicators_raw = [
                ("Missing HTTPS / Plain HTTP", no_https_count),
                ("Phishing Keywords in Path/Query", kw_count),
                ("Excessive Subdomains (>=3)", subdomain_count),
                ("URL Shortening Service", shortener_count),
                ("Raw IP Address in URL", ip_count),
                ("Credential Divider (@)", at_count),
            ]

            for name, count in indicators_raw:
                top_indicators.append(
                    IndicatorStat(
                        name=name,
                        count=count,
                        percentage=round((count / total_features) * 100, 1)
                    )
                )

        # 7-day Scan Trends
        now = datetime.now(timezone.utc)
        scan_trends: List[DailyScanTrend] = []
        for i in range(6, -1, -1):
            day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            date_str = day_start.strftime("%b %d")

            day_legit = db.query(func.count(Scan.id)).filter(
                Scan.created_at >= day_start,
                Scan.created_at < day_end,
                Scan.prediction == "LEGITIMATE"
            ).scalar() or 0

            day_susp = db.query(func.count(Scan.id)).filter(
                Scan.created_at >= day_start,
                Scan.created_at < day_end,
                Scan.prediction == "SUSPICIOUS"
            ).scalar() or 0

            day_phish = db.query(func.count(Scan.id)).filter(
                Scan.created_at >= day_start,
                Scan.created_at < day_end,
                Scan.prediction == "PHISHING"
            ).scalar() or 0

            scan_trends.append(
                DailyScanTrend(
                    date=date_str,
                    legitimate=day_legit,
                    suspicious=day_susp,
                    phishing=day_phish,
                    total=day_legit + day_susp + day_phish
                )
            )

        # 5 most recent scans
        recent = db.query(Scan).order_by(desc(Scan.created_at)).limit(5).all()
        recent_scans = [ScanHistoryItem.model_validate(s) for s in recent]

        return DashboardStatsResponse(
            total_scans=total_scans,
            total_phishing=phishing_count,
            total_suspicious=suspicious_count,
            total_legitimate=legitimate_count,
            phishing_rate=phishing_rate,
            average_risk_score=avg_risk,
            risk_distribution=risk_dist,
            top_indicators=top_indicators,
            scan_trends_7d=scan_trends,
            recent_scans=recent_scans
        )
