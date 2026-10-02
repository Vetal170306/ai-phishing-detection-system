# AI-Based Phishing Website Detection System — Architecture Specification

## 1. System Overview & Objective
The **AI-Based Phishing Website Detection System** is an educational and security-assistance web platform. It enables internet users, students, cybersecurity learners, and IT administrators to evaluate suspicious URLs in real-time. The system extracts static lexical, structural, and domain-level indicators from the URL string, feeds them into a trained machine-learning model, and produces:
1. Classification label: **LEGITIMATE**, **SUSPICIOUS**, or **PHISHING**
2. Continuous **Risk Score** (0–100)
3. Confidence metric
4. Transparent, explainable warning signs (e.g., presence of IP address, domain entropy, excess hyphens/subdomains, credential harvesting path patterns)

---

## 2. Technology Stack & Design Decisions

| Layer | Technology | Rationale & Design Decision |
|---|---|---|
| **Frontend UI** | **React + Vite** (Vanilla Modern CSS & Glassmorphism) | High responsiveness, fast HMR, cybersecurity-themed dark UI, modular components, accessible badges/icons. |
| **Backend API** | **Python (FastAPI)** | High-throughput asynchronous REST API, automatic OpenAPI/Swagger docs, native Python AI/ML ecosystem. |
| **Authentication** | **JWT (JSON Web Tokens) + Argon2id** | Stateless session tokens, modern cryptographic password hashing (`argon2-cffi`), client-side deletion for logout. |
| **Database** | **SQLite (Dev) / PostgreSQL (Prod)** | Dual-compatible relational schema using SQLAlchemy ORM; switchable via single `DATABASE_URL` environment variable. |
| **ML Engine** | **Scikit-Learn + Joblib** | Reproducible supervised classifiers (Random Forest, Gradient Boosting, Logistic Regression) saved via `joblib`, scikit-learn version pinned. |
| **Dataset** | **PhiUSIIL Phishing URL Dataset (UCI)** | Real-world benchmark dataset. Feature extraction operates exclusively on static URL string properties. |

---

## 3. High-Level System Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                    |
|  React 18 SPA (Vite)                                                            |
|  - Modern Dark Cybersecurity UI / Glassmorphism                                  |
|  - Pages: Landing, Scanner, Result, Dashboard, History, Education, Admin, Auth |
|  - State: AuthContext, ScanState, Protected Route Guard                         |
+---------------------------------------+-----------------------------------------+
                                        | HTTP / JSON (Axios)
                                        | Bearer JWT Authentication
                                        v
+---------------------------------------------------------------------------------+
|                                 API GATEWAY LAYER                               |
|  FastAPI Application (uvicorn)                                                  |
|  - CORS Middleware, Request Validation (Pydantic v2)                            |
|  - Rate Limiting, Centralized Error Handling                                    |
|  - Routers: /api/auth, /api/scans, /api/dashboard, /api/admin, /api/health      |
+-------------------+-----------------------------------+-------------------------+
                    |                                   |
                    v                                   v
+---------------------------------------+   +-------------------------------------+
|        APPLICATION & ML SERVICES      |   |            DATA ACCESS              |
|  1. URL Normalizer & Validator        |   |  SQLAlchemy 2.0 ORM                 |
|     - RFC 3986 normalization          |   |  - Users Repository                 |
|     - Scheme, FQDN, TLD checks        |   |  - Scans Repository                 |
|     - Length & malicious input guards |   |  - Scan Features Repository         |
|  2. Static Feature Extraction         |   |  - Model Version Repository         |
|     - 18+ Lexical/Structural metrics  |   +------------------+------------------+
|     - Zero HTTP/Network requests      |                      |
|  3. ML Model Inference Engine         |                      v
|     - Pre-loaded in-memory model      |   +-------------------------------------+
|     - Probability score extraction    |   |             DATABASE                |
|  4. Risk Score & Explainability       |   |  SQLite (Local Development) /       |
|     - 0-35: Legitimate (Low)          |   |  PostgreSQL (Production)            |
|     - 36-70: Suspicious (Medium)      |   |  - Normalized 3NF Tables            |
|     - 71-100: Phishing (High)         |   |  - Foreign Keys & B-Tree Indexes    |
|     - Rule-based warning generator    |   +-------------------------------------+
+---------------------------------------+
```

---

## 4. End-to-End URL Processing & Prediction Pipeline

```
[ User Input URL ]
        │
        ▼
[ URL Validator & Normalizer ] ───(Invalid URL)───► [ 422 Unprocessable Entity ]
        │
        ▼
[ Static Feature Extractor ]
        │  * Lengths, counts, ratios, entropy, IP check, keyword flags
        ▼
[ Feature Vector Vectorizer / Scaler ]
        │
        ▼
[ Scikit-Learn Model (Joblib) ]
        │
        ▼
[ Phishing Probability: p ∈ [0.0, 1.0] ]
        │
        ├── Risk Score = round(p * 100)
        │
        ├── Prediction Label:
        │     • p < 0.35  ──► LEGITIMATE (Low Risk)
        │     • 0.35 <= p <= 0.70 ──► SUSPICIOUS (Medium Risk)
        │     • p > 0.70  ──► PHISHING (High Risk)
        │
        ├── Confidence = max(p, 1 - p)
        │
        └── Warning Signs Generation (Heuristic flag correlation)
        │
        ▼
[ Database Persistence (scans + scan_features) ]
        │
        ▼
[ JSON Response to React Client ]
```

---

## 5. Security & Isolation Principles
1. **Zero Outbound Execution**: The scanner performs **strictly static feature extraction** on the URL string. The backend never fetches, crawls, or opens arbitrary user URLs in headless browsers or sockets. This prevents Server-Side Request Forgery (SSRF) and malware downloads.
2. **Password Cryptography**: Passwords are never logged or stored in plaintext. Passwords are keyed using Argon2id (`argon2-cffi`), which provides memory-hard protection against ASIC/GPU brute-force attacks.
3. **Stateless Authorization**: Short/medium-lived JWTs (HMAC-SHA256) are used for authentication. Tokens are stored client-side in secure browser storage; logout clears the client token.
4. **Role-Based Access Control (RBAC)**: Users hold a `role` (`USER` or `ADMIN`). Admin routes (`/api/admin/*`) enforce strict role validation dependencies.
