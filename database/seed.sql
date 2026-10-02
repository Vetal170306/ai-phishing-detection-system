-- ====================================================================
-- AI-Based Phishing Website Detection System
-- Database Seed Data (Sample users, model version, and initial scans)
-- ====================================================================

-- 1. SEED USERS
-- Passwords hashed using Argon2id (Admin@123 and User@123)
INSERT INTO users (id, name, email, password_hash, role, is_active, created_at, updated_at) VALUES
(1, 'System Administrator', 'admin@phishshield.local', '$argon2id$v=19$m=65536,t=3,p=4$DY5TxMYuVWN4ryu/VnkjWQ$I2VmAHLxLzxYdinubL/nTTZ0v+ImWAFyle8uUazy8Bc', 'ADMIN', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Test Student User', 'user@phishshield.local', '$argon2id$v=19$m=65536,t=3,p=4$8606zbiEpXAFxqaPJsQyCA$TYmNY0aPc+vdZqtfO5gvOCCJPHim7bFGDBxeM3nh2yI', 'USER', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. SEED ACTIVE MODEL VERSION
INSERT INTO model_versions (id, model_name, version, algorithm, accuracy, precision_score, recall_score, f1_score, is_active, created_at) VALUES
(1, 'PhiUSIIL-URL-Detector', 'v1.0.0', 'Random Forest Classifier', 0.965, 0.962, 0.968, 0.965, 1, CURRENT_TIMESTAMP);

-- 3. SEED INITIAL SCANS
-- Scan 1: Legitimate (Google)
INSERT INTO scans (id, user_id, model_version_id, url, normalized_url, prediction, confidence, risk_score, risk_level, created_at) VALUES
(1, 2, 1, 'https://www.google.com', 'https://www.google.com', 'LEGITIMATE', 0.98, 2, 'LOW', CURRENT_TIMESTAMP);

-- Scan 2: Phishing (IP address + credential harvesting path)
INSERT INTO scans (id, user_id, model_version_id, url, normalized_url, prediction, confidence, risk_score, risk_level, created_at) VALUES
(2, 2, 1, 'http://192.168.1.100/paypal-login/update-account/signin.php?token=xyz', 'http://192.168.1.100/paypal-login/update-account/signin.php?token=xyz', 'PHISHING', 0.96, 96, 'HIGH', CURRENT_TIMESTAMP);

-- Scan 3: Suspicious (Multiple hyphens, keyword stuffing, no HTTPS)
INSERT INTO scans (id, user_id, model_version_id, url, normalized_url, prediction, confidence, risk_score, risk_level, created_at) VALUES
(3, 2, 1, 'http://secure-update-bank-verification.com/account', 'http://secure-update-bank-verification.com/account', 'SUSPICIOUS', 0.58, 58, 'MEDIUM', CURRENT_TIMESTAMP);

-- 4. SEED SCAN FEATURES (1-to-1 with Scans)
INSERT INTO scan_features (
    id, scan_id, url_length, domain_length, subdomain_count, dot_count, hyphen_count,
    digit_count, special_character_count, has_ip, has_https, has_at_symbol,
    suspicious_keyword_count, url_shortener_detected, parameter_count, path_segment_count,
    domain_entropy, digit_ratio, created_at
) VALUES
(1, 1, 22, 14, 1, 2, 0, 0, 4, 0, 1, 0, 0, 0, 0, 0, 2.72, 0.000, CURRENT_TIMESTAMP),
(2, 2, 70, 13, 0, 4, 2, 11, 8, 1, 0, 0, 3, 0, 1, 3, 3.12, 0.157, CURRENT_TIMESTAMP),
(3, 3, 49, 36, 0, 1, 3, 0, 4, 0, 0, 0, 3, 0, 0, 1, 3.48, 0.000, CURRENT_TIMESTAMP);
