"""
Database Initialization & Validation Script
AI-Based Phishing Website Detection System

Initializes SQLite database using schema.sql and seed.sql,
verifies foreign keys, tables, and indices.
"""

import os
import sqlite3
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "phishing_detection.db")
SCHEMA_PATH = os.path.join(BASE_DIR, "database", "schema.sql")
SEED_PATH = os.path.join(BASE_DIR, "database", "seed.sql")


def init_database(reset: bool = True):
    print("=" * 60)
    print("AI-BASED PHISHING WEBSITE DETECTION SYSTEM")
    print("Stage 1: Database Initialization & Validation")
    print("=" * 60)

    if reset and os.path.exists(DB_PATH):
        print(f"[*] Removing existing database file: {DB_PATH}")
        os.remove(DB_PATH)

    print(f"[*] Connecting to SQLite database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    cursor = conn.cursor()

    # 1. Execute schema.sql
    print(f"[*] Applying schema from: {SCHEMA_PATH}")
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema_sql = f.read()
    cursor.executescript(schema_sql)
    print("    [+] Schema applied successfully.")

    # 2. Execute seed.sql
    print(f"[*] Seeding initial data from: {SEED_PATH}")
    with open(SEED_PATH, "r", encoding="utf-8") as f:
        seed_sql = f.read()
    cursor.executescript(seed_sql)
    conn.commit()
    print("    [+] Seed data inserted successfully.")

    # 3. Verify Tables & Counts
    print("\n[*] Validating Tables & Row Counts:")
    tables = ["users", "model_versions", "scans", "scan_features"]
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        cursor.execute(f"PRAGMA table_info({table})")
        columns = [col[1] for col in cursor.fetchall()]
        print(f"    - Table '{table}': {count} rows, {len(columns)} columns -> ({', '.join(columns[:4])}...)")

    # 4. Verify Indexes
    print("\n[*] Validating Indexes:")
    cursor.execute("SELECT name, tbl_name FROM sqlite_master WHERE type = 'index' AND name LIKE 'idx_%';")
    indexes = cursor.fetchall()
    for idx_name, tbl_name in indexes:
        print(f"    - Index '{idx_name}' on table '{tbl_name}'")

    # 5. Verify Foreign Key Integrity
    print("\n[*] Checking Foreign Key Integrity:")
    cursor.execute("PRAGMA foreign_key_check;")
    fk_violations = cursor.fetchall()
    if fk_violations:
        print(f"    [!] Foreign Key Violations detected: {fk_violations}")
        sys.exit(1)
    else:
        print("    [+] All Foreign Key constraints are healthy (0 violations).")

    conn.close()
    print("\n[+] Stage 1 Database initialization completed successfully!\n")


if __name__ == "__main__":
    init_database(reset=True)
