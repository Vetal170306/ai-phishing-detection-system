"""
Unit Tests for Machine Learning Model Inference Engine
"""

import pytest
from backend.app.ml.predictor import PhishingPredictor, predictor


def test_model_loaded():
    assert predictor is not None
    assert predictor.model is not None
    assert predictor.algorithm == "HistGradientBoosting Classifier"
    assert predictor.version == "v1.0.0"


def test_legitimate_url_prediction():
    res = predictor.predict("https://www.google.com")
    assert res["prediction"] == "LEGITIMATE"
    assert res["risk_level"] == "LOW"
    assert res["risk_score"] <= 35
    assert res["confidence"] >= 0.80
    assert len(res["safe_indicators"]) > 0


def test_phishing_url_prediction():
    # IP address, unencrypted HTTP, credential harvesting path
    res = predictor.predict("http://192.168.1.100/paypal-login/update-account/signin.php?token=xyz")
    assert res["prediction"] == "PHISHING"
    assert res["risk_level"] == "HIGH"
    assert res["risk_score"] >= 70
    assert res["confidence"] >= 0.80
    # Must have critical/high warning signs
    severities = [w["severity"] for w in res["warning_signs"]]
    assert "CRITICAL" in severities or "HIGH" in severities


def test_risk_score_bounds():
    urls = [
        "https://github.com",
        "https://wikipedia.org",
        "http://suspicious-security-verification.com/login",
        "http://bit.ly/12345"
    ]
    for url in urls:
        res = predictor.predict(url)
        assert 0 <= res["risk_score"] <= 100
        assert 0.50 <= res["confidence"] <= 1.00
        assert res["prediction"] in ["LEGITIMATE", "SUSPICIOUS", "PHISHING"]
        assert res["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
        assert "features" in res
        assert len(res["features"]) == 20
