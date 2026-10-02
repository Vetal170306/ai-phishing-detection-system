-- ====================================================================
-- AI-Based Phishing Website Detection System
-- PostgreSQL Native Production Database Schema
-- ====================================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK(role IN ('USER', 'ADMIN')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS model_versions (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL UNIQUE,
    algorithm VARCHAR(100) NOT NULL,
    accuracy DOUBLE PRECISION,
    precision_score DOUBLE PRECISION,
    recall_score DOUBLE PRECISION,
    f1_score DOUBLE PRECISION,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    model_version_id INTEGER REFERENCES model_versions(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    normalized_url TEXT NOT NULL,
    prediction VARCHAR(20) NOT NULL CHECK(prediction IN ('LEGITIMATE', 'SUSPICIOUS', 'PHISHING')),
    confidence DOUBLE PRECISION NOT NULL,
    risk_score INTEGER NOT NULL,
    risk_level VARCHAR(20) NOT NULL CHECK(risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scan_features (
    id SERIAL PRIMARY KEY,
    scan_id INTEGER NOT NULL UNIQUE REFERENCES scans(id) ON DELETE CASCADE,
    url_length INTEGER NOT NULL,
    domain_length INTEGER NOT NULL,
    subdomain_count INTEGER NOT NULL,
    dot_count INTEGER NOT NULL,
    hyphen_count INTEGER NOT NULL,
    digit_count INTEGER NOT NULL,
    special_character_count INTEGER NOT NULL,
    has_ip BOOLEAN NOT NULL DEFAULT FALSE,
    has_https BOOLEAN NOT NULL DEFAULT FALSE,
    has_at_symbol BOOLEAN NOT NULL DEFAULT FALSE,
    suspicious_keyword_count INTEGER NOT NULL DEFAULT 0,
    url_shortener_detected BOOLEAN NOT NULL DEFAULT FALSE,
    parameter_count INTEGER NOT NULL DEFAULT 0,
    path_segment_count INTEGER NOT NULL DEFAULT 0,
    domain_entropy DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    digit_ratio DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_prediction ON scans(prediction);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at);
CREATE INDEX IF NOT EXISTS idx_scan_features_scan_id ON scan_features(scan_id);
