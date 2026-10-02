# AI-Based Phishing Website Detection System — Database Architecture & ER Specification

## 1. Entity-Relationship (ER) Overview

The database design follows Third Normal Form (3NF) principles to eliminate data redundancy while maintaining referential integrity across users, scan events, extracted features, and machine-learning model versions.

```
+--------------------+               +-----------------------------+
|       users        |               |       model_versions        |
+--------------------+               +-----------------------------+
| PK  id             |               | PK  id                      |
|     name           |               |     model_name              |
|     email          |               |     version (UNIQUE)        |
|     password_hash  |               |     algorithm               |
|     role           |               |     accuracy, precision,    |
|     is_active      |               |     recall, f1_score        |
|     created_at     |               |     is_active               |
|     updated_at     |               |     created_at              |
+---------+----------+               +--------------+--------------+
          | 1                                       | 1
          |                                         |
          | 0..*                                    | 0..*
+---------v-----------------------------------------v--------------+
|                              scans                               |
+------------------------------------------------------------------+
| PK  id                                                           |
| FK  user_id (REFERENCES users.id ON DELETE SET NULL)             |
| FK  model_version_id (REFERENCES model_versions.id ON DELETE SET NULL) |
|     url                                                          |
|     normalized_url                                               |
|     prediction ('LEGITIMATE', 'SUSPICIOUS', 'PHISHING')          |
|     confidence (0.0 to 1.0)                                      |
|     risk_score (0 to 100)                                        |
|     risk_level ('LOW', 'MEDIUM', 'HIGH')                         |
|     created_at                                                   |
+---------------------------------+--------------------------------+
                                  | 1
                                  |
                                  | 1
+---------------------------------v--------------------------------+
|                          scan_features                           |
+------------------------------------------------------------------+
| PK  id                                                           |
| FK  scan_id (REFERENCES scans.id ON DELETE CASCADE, UNIQUE)      |
|     url_length, domain_length, subdomain_count, dot_count        |
|     hyphen_count, digit_count, special_character_count           |
|     has_ip, has_https, has_at_symbol                             |
|     suspicious_keyword_count, url_shortener_detected             |
|     parameter_count, path_segment_count                          |
|     domain_entropy, digit_ratio                                  |
|     created_at                                                   |
+------------------------------------------------------------------+
```

---

## 2. Table Specifications

### 2.1 `users`
Stores user profile information, authentication credentials, and authorization roles.

| Column | Type (PostgreSQL / SQLite) | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` / `INTEGER` | PRIMARY KEY, AUTOINCREMENT | Unique user identifier |
| `name` | `VARCHAR(100)` | NOT NULL | User's full display name |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | User's login email address (indexed) |
| `password_hash` | `VARCHAR(255)` | NOT NULL | Argon2id cryptographically hashed password |
| `role` | `VARCHAR(20)` | NOT NULL, DEFAULT 'USER', CHECK (`role` IN ('USER', 'ADMIN')) | Role for RBAC authorization |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE / 1 | Account active/disabled flag |
| `created_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | Registration timestamp |
| `updated_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | Last profile update timestamp |

### 2.2 `model_versions`
Catalogs trained machine-learning model files, hyperparameters, evaluation metrics, and active deployment status.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` / `INTEGER` | PRIMARY KEY, AUTOINCREMENT | Model version ID |
| `model_name` | `VARCHAR(100)` | NOT NULL | Human-readable model identifier |
| `version` | `VARCHAR(50)` | NOT NULL, UNIQUE | Semantic version string (e.g. `v1.0.0`) |
| `algorithm` | `VARCHAR(100)` | NOT NULL | Classifier name (e.g. `Random Forest`) |
| `accuracy` | `FLOAT / REAL` | NULLABLE | Validation accuracy |
| `precision_score` | `FLOAT / REAL` | NULLABLE | Precision for phishing class |
| `recall_score` | `FLOAT / REAL` | NULLABLE | Recall for phishing class |
| `f1_score` | `FLOAT / REAL` | NULLABLE | Harmonic mean of precision & recall |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE / 1 | Model currently loaded in inference engine |
| `created_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | Model registration timestamp |

### 2.3 `scans`
Central audit log of all URL scans performed.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` / `INTEGER` | PRIMARY KEY, AUTOINCREMENT | Unique scan record ID |
| `user_id` | `INTEGER` | NULLABLE, FK (`users.id`), ON DELETE SET NULL | Scanning user (indexed) |
| `model_version_id` | `INTEGER` | NULLABLE, FK (`model_versions.id`), ON DELETE SET NULL | Model version used |
| `url` | `TEXT` | NOT NULL | Original user-submitted URL |
| `normalized_url` | `TEXT` | NOT NULL | Canonical normalized URL string |
| `prediction` | `VARCHAR(20)` | NOT NULL, CHECK (`prediction` IN ('LEGITIMATE', 'SUSPICIOUS', 'PHISHING')) | Result classification (indexed) |
| `confidence` | `FLOAT / REAL` | NOT NULL | Class probability confidence (0.00–1.00) |
| `risk_score` | `INTEGER` | NOT NULL | Calibrated risk metric (0–100) |
| `risk_level` | `VARCHAR(20)` | NOT NULL, CHECK (`risk_level` IN ('LOW', 'MEDIUM', 'HIGH')) | High-level risk grouping |
| `created_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | Scan execution timestamp (indexed) |

### 2.4 `scan_features`
Stores 1-to-1 static lexical and structural features calculated from the URL for full auditability and explainability.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` / `INTEGER` | PRIMARY KEY, AUTOINCREMENT | Feature row ID |
| `scan_id` | `INTEGER` | NOT NULL, UNIQUE, FK (`scans.id`), ON DELETE CASCADE | Associated scan record ID (indexed) |
| `url_length` | `INTEGER` | NOT NULL | Total length of the URL string |
| `domain_length` | `INTEGER` | NOT NULL | Length of the domain/FQDN |
| `subdomain_count` | `INTEGER` | NOT NULL | Number of subdomain levels |
| `dot_count` | `INTEGER` | NOT NULL | Number of dot (`.`) characters in URL |
| `hyphen_count` | `INTEGER` | NOT NULL | Number of hyphen (`-`) characters in URL |
| `digit_count` | `INTEGER` | NOT NULL | Number of numerical digits in URL |
| `special_character_count`| `INTEGER` | NOT NULL | Count of non-alphanumeric URL characters |
| `has_ip` | `BOOLEAN` | NOT NULL, DEFAULT 0 | 1 if domain is an IPv4/IPv6 address |
| `has_https` | `BOOLEAN` | NOT NULL, DEFAULT 0 | 1 if URL uses HTTPS protocol |
| `has_at_symbol` | `BOOLEAN` | NOT NULL, DEFAULT 0 | 1 if URL contains `@` credential divider |
| `suspicious_keyword_count`| `INTEGER` | NOT NULL, DEFAULT 0 | Occurrences of phishing terms (login, verify, etc.) |
| `url_shortener_detected` | `BOOLEAN` | NOT NULL, DEFAULT 0 | 1 if domain matches known URL shorteners (bit.ly, etc.) |
| `parameter_count` | `INTEGER` | NOT NULL, DEFAULT 0 | Number of query string parameters |
| `path_segment_count`| `INTEGER` | NOT NULL, DEFAULT 0 | Number of path levels |
| `domain_entropy` | `FLOAT / REAL` | NOT NULL, DEFAULT 0.0 | Shannon entropy of domain characters |
| `digit_ratio` | `FLOAT / REAL` | NOT NULL, DEFAULT 0.0 | Ratio of digits to total characters |
| `created_at` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | Feature extraction timestamp |

---

## 3. Database Indexes
High-throughput queries are accelerated via B-Tree indexes:
1. `idx_users_email` — Fast O(log N) lookup during user authentication and registration deduplication.
2. `idx_scans_user_id` — Fast user scan history filtering and pagination.
3. `idx_scans_prediction` — Accelerated dashboard aggregation for Legitimate vs Phishing metrics.
4. `idx_scans_created_at` — Time-series ordering for recent scan feeds and activity charts.
5. `idx_scan_features_scan_id` — Instant 1-to-1 join from scan record to detailed feature explainability.

---

## 4. Multi-Engine Compatibility (SQLite & PostgreSQL)
- **Local Development**: Uses file-based SQLite database (`phishing_detection.db`) with `PRAGMA foreign_keys = ON;`.
- **Production Deployment**: Uses PostgreSQL by updating `DATABASE_URL=postgresql://user:password@host:5432/dbname`.
- SQLAlchemy ORM dynamically adapts table creation, data types, and sequences across both database engines transparently.
