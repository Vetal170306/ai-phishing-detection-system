"""
Unit Tests for URL Static Feature Extraction Module
"""

import pytest
from backend.app.ml.feature_extractor import FeatureExtractor, normalize_url, calculate_entropy


def test_normalize_url():
    # Prepend scheme if missing
    assert normalize_url("google.com").startswith("http://")
    # Lowercase scheme and domain
    assert normalize_url("HTTPS://EXAMPLE.COM/PATH") == "https://example.com/PATH"
    # Preserve query string
    assert normalize_url("example.com/search?q=test") == "http://example.com/search?q=test"


def test_ip_address_detection():
    feats_ip = FeatureExtractor.extract_features("http://192.168.0.1/admin/login")
    assert feats_ip["has_ip"] == 1
    assert feats_ip["subdomain_count"] == 0
    assert feats_ip["tld_length"] == 0

    feats_domain = FeatureExtractor.extract_features("https://www.google.com")
    assert feats_domain["has_ip"] == 0


def test_https_detection():
    feats_secure = FeatureExtractor.extract_features("https://secure.bank.com")
    assert feats_secure["has_https"] == 1

    feats_insecure = FeatureExtractor.extract_features("http://insecure.bank.com")
    assert feats_insecure["has_https"] == 0


def test_subdomain_counting():
    feats_1 = FeatureExtractor.extract_features("https://example.com")
    assert feats_1["subdomain_count"] == 0

    feats_2 = FeatureExtractor.extract_features("https://sub.example.com")
    assert feats_2["subdomain_count"] == 1

    feats_3 = FeatureExtractor.extract_features("https://a.b.c.example.com")
    assert feats_3["subdomain_count"] == 3


def test_suspicious_keywords():
    feats_kw = FeatureExtractor.extract_features("http://paypal-verification.com/login/update-account")
    # 'paypal', 'verification', 'login', 'update', 'account'
    assert feats_kw["suspicious_keyword_count"] >= 3

    feats_clean = FeatureExtractor.extract_features("https://weather.gov/forecast")
    assert feats_clean["suspicious_keyword_count"] == 0


def test_entropy_calculation():
    # Repeated chars have 0 entropy
    assert calculate_entropy("aaaaaa") == 0.0
    # Random text has higher entropy
    assert calculate_entropy("a8f93kd9q01") > 3.0


def test_shortener_detection():
    feats_bitly = FeatureExtractor.extract_features("http://bit.ly/3xyz123")
    assert feats_bitly["url_shortener_detected"] == 1

    feats_normal = FeatureExtractor.extract_features("https://github.com/torvalds/linux")
    assert feats_normal["url_shortener_detected"] == 0
