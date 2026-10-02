-- ====================================================================
-- AI-Based Phishing Website Detection System
-- Database Schema (PostgreSQL & SQLite Dual-Compatible DDL)
-- ====================================================================

-- 1. USERS TABLE
-- Stores authenticated users, role-based authorization (USER / ADMIN),
-- and argon2-hashed credentials.
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK(role IN ('USER', 'ADMIN')),
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. MODEL_VERSIONS TABLE
-- Tracks active and historical ML classification models, algorithms, and evaluation metrics.
CREATE TABLE IF NOT EXISTS model_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_name VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL UNIQUE,
    algorithm VARCHAR(100) NOT NULL,
    accuracy REAL,
    precision_score REAL,
    recall_score REAL,
    f1_score REAL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. SCANS TABLE
-- Records each analyzed URL, classification result, risk score (0-100),
-- and links to the scanning user (if authenticated) and model version used.
CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    model_version_id INTEGER,
    url TEXT NOT NULL,
    normalized_url TEXT NOT NULL,
    prediction VARCHAR(20) NOT NULL CHECK(prediction IN ('LEGITIMATE', 'SUSPICIOUS', 'PHISHING')),
    confidence REAL NOT NULL,
    risk_score INTEGER NOT NULL,
    risk_level VARCHAR(20) NOT NULL CHECK(risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (model_version_id) REFERENCES model_versions(id) ON DELETE SET NULL
);

-- 4. SCAN_FEATURES TABLE
-- 1-to-1 relationship with SCANS. Stores static URL-extracted features used
-- for ML inference and risk explainability.
CREATE TABLE IF NOT EXISTS scan_features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_id INTEGER NOT NULL UNIQUE,
    url_length INTEGER NOT NULL,
    domain_length INTEGER NOT NULL,
    subdomain_count INTEGER NOT NULL,
    dot_count INTEGER NOT NULL,
    hyphen_count INTEGER NOT NULL,
    digit_count INTEGER NOT NULL,
    special_character_count INTEGER NOT NULL,
    has_ip BOOLEAN NOT NULL DEFAULT 0,
    has_https BOOLEAN NOT NULL DEFAULT 0,
    has_at_symbol BOOLEAN NOT NULL DEFAULT 0,
    suspicious_keyword_count INTEGER NOT NULL DEFAULT 0,
    url_shortener_detected BOOLEAN NOT NULL DEFAULT 0,
    parameter_count INTEGER NOT NULL DEFAULT 0,
    path_segment_count INTEGER NOT NULL DEFAULT 0,
    domain_entropy REAL NOT NULL DEFAULT 0.0,
    digit_ratio REAL NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
);

-- ====================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_prediction ON scans(prediction);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at);
CREATE INDEX IF NOT EXISTS idx_scan_features_scan_id ON scan_features(scan_id);
