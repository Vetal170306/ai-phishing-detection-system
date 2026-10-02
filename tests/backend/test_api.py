"""
Backend API Comprehensive Integration Tests
AI-Based Phishing Website Detection System
"""

import pytest


def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"
    assert data["database"] == "HEALTHY"


def test_user_registration_and_login(client):
    # 1. Register
    reg_payload = {
        "name": "Jane Security",
        "email": "jane@example.com",
        "password": "SuperSecretPassword123!"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == "jane@example.com"

    # 2. Duplicate registration should fail
    dup_res = client.post("/api/auth/register", json=reg_payload)
    assert dup_res.status_code == 400

    # 3. Login
    login_payload = {
        "email": "jane@example.com",
        "password": "SuperSecretPassword123!"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data

    # 4. Get profile
    token = login_data["access_token"]
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["name"] == "Jane Security"


def test_public_and_authenticated_scan(client, user_auth_headers):
    # 1. Public scan (anonymous)
    scan_payload = {"url": "https://www.google.com"}
    res = client.post("/api/scans", json=scan_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["prediction"] in ["LEGITIMATE", "SUSPICIOUS", "PHISHING"]
    assert "risk_score" in data
    assert "confidence" in data
    assert "features" in data
    assert len(data["safe_indicators"]) > 0

    # 2. Phishing URL scan (authenticated)
    phish_payload = {"url": "http://192.168.1.100/paypal/login-verify.php?token=xyz"}
    res_phish = client.post("/api/scans", json=phish_payload, headers=user_auth_headers)
    assert res_phish.status_code == 201
    data_phish = res_phish.json()
    assert data_phish["risk_score"] > 50
    assert len(data_phish["warning_signs"]) > 0

    # 3. Batch scan
    batch_payload = {
        "urls": [
            "https://wikipedia.org",
            "http://10.0.0.1/bank/login",
            "https://github.com"
        ]
    }
    batch_res = client.post("/api/scans/batch", json=batch_payload, headers=user_auth_headers)
    assert batch_res.status_code == 200
    batch_data = batch_res.json()
    assert batch_data["total_scanned"] == 3
    assert len(batch_data["results"]) == 3


def test_scan_history_and_detail(client, user_auth_headers):
    # Run two scans
    client.post("/api/scans", json={"url": "https://safe-domain.org"}, headers=user_auth_headers)
    scan2 = client.post("/api/scans", json={"url": "http://192.168.0.1/steal-creds"}, headers=user_auth_headers).json()

    # Get history
    history_res = client.get("/api/scans/history", headers=user_auth_headers)
    assert history_res.status_code == 200
    h_data = history_res.json()
    assert h_data["total"] >= 2
    assert len(h_data["items"]) >= 2

    # Get single scan detail
    detail_res = client.get(f"/api/scans/{scan2['id']}")
    assert detail_res.status_code == 200
    d_data = detail_res.json()
    assert d_data["id"] == scan2["id"]
    assert d_data["url"] == "http://192.168.0.1/steal-creds"


def test_dashboard_stats(client, user_auth_headers):
    # Populate a few scans
    client.post("/api/scans", json={"url": "https://google.com"}, headers=user_auth_headers)
    client.post("/api/scans", json={"url": "http://1.2.3.4/paypal-login"}, headers=user_auth_headers)

    res = client.get("/api/dashboard/stats")
    assert res.status_code == 200
    data = res.json()
    assert data["total_scans"] >= 2
    assert "risk_distribution" in data
    assert "scan_trends_7d" in data
    assert len(data["scan_trends_7d"]) == 7


def test_admin_endpoints(client, user_auth_headers, admin_auth_headers):
    # Regular user cannot access admin routes (403)
    user_res = client.get("/api/admin/users", headers=user_auth_headers)
    assert user_res.status_code == 403

    # Admin can access users list and model status
    admin_users_res = client.get("/api/admin/users", headers=admin_auth_headers)
    assert admin_users_res.status_code == 200
    assert len(admin_users_res.json()) >= 2

    admin_model_res = client.get("/api/admin/model-status", headers=admin_auth_headers)
    assert admin_model_res.status_code == 200
    assert admin_model_res.json()["status"] in ["OPERATIONAL", "FALLBACK_HEURISTIC"]
