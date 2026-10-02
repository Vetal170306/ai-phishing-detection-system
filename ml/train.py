"""
Machine Learning Training Pipeline
AI-Based Phishing Website Detection System

Trains multiple candidate classification models on static URL features
extracted from the PhiUSIIL Phishing URL Dataset. Evaluates accuracy,
precision, recall, F1, and ROC-AUC, selects the champion model, and
exports serialized artifacts and metrics.
"""

import json
import os
import sqlite3
import sys
import time
from typing import Any, Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

# Ensure root directory is on python path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from ml.feature_extractor import FEATURE_NAMES, FeatureExtractor

DATASET_PATH = os.path.join(BASE_DIR, "ml", "dataset", "PhiUSIIL_Phishing_URL_Dataset.csv")
MODEL_DIR = os.path.join(BASE_DIR, "ml", "model")
BACKEND_ML_DIR = os.path.join(BASE_DIR, "backend", "app", "ml")
DB_PATH = os.path.join(BASE_DIR, "phishing_detection.db")


def load_and_preprocess_data(sample_size: int = 100000) -> Tuple[np.ndarray, np.ndarray, pd.DataFrame]:
    print("=" * 65)
    print("STAGE 2: MACHINE LEARNING MODEL DEVELOPMENT & TRAINING")
    print("=" * 65)
    print(f"[*] Loading PhiUSIIL dataset from: {DATASET_PATH}")
    
    # Read URLs and labels
    df = pd.read_csv(DATASET_PATH, usecols=["URL", "label"])
    total_rows = len(df)
    print(f"[+] Loaded {total_rows:,} raw URLs from CSV.")
    
    # In PhiUSIIL: 0 = Phishing, 1 = Legitimate.
    # We map target y = 1 for Phishing, 0 for Legitimate.
    df["is_phishing"] = (df["label"] == 0).astype(int)
    
    phishing_count = int(df["is_phishing"].sum())
    legit_count = total_rows - phishing_count
    print(f"    - Phishing URLs (y=1): {phishing_count:,}")
    print(f"    - Legitimate URLs (y=0): {legit_count:,}")
    
    # Sample balanced dataset for training efficiency and optimal generalization
    half_sample = sample_size // 2
    df_phish = df[df["is_phishing"] == 1].sample(n=min(half_sample, phishing_count), random_state=42)
    df_legit = df[df["is_phishing"] == 0].sample(n=min(half_sample, legit_count), random_state=42)
    df_balanced = pd.concat([df_phish, df_legit]).sample(frac=1.0, random_state=42).reset_index(drop=True)
    
    print(f"\n[*] Sampled balanced training subset of {len(df_balanced):,} URLs (50% Phishing, 50% Legitimate)")
    print("[*] Extracting 19 static lexical, structural, and domain features...")
    
    t0 = time.time()
    feature_vectors = [FeatureExtractor.extract_vector(str(url)) for url in df_balanced["URL"]]
    X = np.array(feature_vectors, dtype=np.float32)
    y = df_balanced["is_phishing"].to_numpy(dtype=np.int32)
    duration = time.time() - t0
    
    print(f"[+] Feature extraction completed in {duration:.2f}s ({len(X)/duration:,.0f} URLs/sec).")
    print(f"    Feature matrix shape: {X.shape}, Label vector shape: {y.shape}")
    
    return X, y, df_balanced


def train_and_evaluate_models(X: np.ndarray, y: np.ndarray):
    # Stratified train/test split: 80% train, 20% test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"\n[*] Stratified dataset split: {len(X_train):,} Train samples, {len(X_test):,} Test samples.")
    
    candidate_models: Dict[str, Any] = {
        "Random Forest Classifier": RandomForestClassifier(
            n_estimators=100,
            max_depth=16,
            min_samples_split=4,
            random_state=42,
            n_jobs=-1
        ),
        "HistGradientBoosting Classifier": HistGradientBoostingClassifier(
            max_iter=120,
            max_depth=12,
            learning_rate=0.1,
            random_state=42
        ),
        "Logistic Regression (Standardized)": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=1000, random_state=42, C=1.0))
        ])
    }
    
    results: Dict[str, Dict[str, Any]] = {}
    best_model_name = ""
    best_f1 = -1.0
    champion_model = None
    
    print("\n" + "=" * 65)
    print(f"{'Model Candidate':<32} | {'Accuracy':<8} | {'Precision':<9} | {'Recall':<7} | {'F1-Score':<8} | {'ROC-AUC':<8}")
    print("-" * 65)
    
    for name, model in candidate_models.items():
        t0 = time.time()
        model.fit(X_train, y_train)
        fit_time = time.time() - t0
        
        y_pred = model.predict(X_test)
        if hasattr(model, "predict_proba"):
            y_prob = model.predict_proba(X_test)[:, 1]
        elif hasattr(model, "decision_function"):
            y_prob = model.decision_function(X_test)
        else:
            y_prob = y_pred
            
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        auc = float(roc_auc_score(y_test, y_prob))
        cm = confusion_matrix(y_test, y_pred).tolist()
        
        results[name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(auc, 4),
            "fit_time_seconds": round(fit_time, 2),
            "confusion_matrix": cm
        }
        
        print(f"{name:<32} | {acc:.4f}   | {prec:.4f}    | {rec:.4f}  | {f1:.4f}   | {auc:.4f}")
        
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            champion_model = model
            
    print("=" * 65)
    print(f"\n[+] Selected Champion Model: {best_model_name} (F1-Score: {best_f1:.4f})")
    
    # Feature importances
    feature_importances: Dict[str, float] = {}
    if hasattr(champion_model, "feature_importances_"):
        for fname, imp in zip(FEATURE_NAMES, champion_model.feature_importances_):
            feature_importances[fname] = round(float(imp), 4)
    elif hasattr(champion_model, "named_steps") and hasattr(champion_model.named_steps.get("clf"), "coef_"):
        coefs = champion_model.named_steps["clf"].coef_[0]
        for fname, c in zip(FEATURE_NAMES, coefs):
            feature_importances[fname] = round(float(c), 4)
    else:
        from sklearn.inspection import permutation_importance
        perm = permutation_importance(champion_model, X_test[:2000], y_test[:2000], n_repeats=3, random_state=42)
        for fname, imp in zip(FEATURE_NAMES, perm.importances_mean):
            feature_importances[fname] = round(float(imp), 4)
            
    # Sort feature importances descending
    sorted_importances = dict(sorted(feature_importances.items(), key=lambda item: abs(item[1]), reverse=True))
    
    print("\n[*] Top 10 Most Influential Phishing Indicators:")
    for i, (fname, imp) in enumerate(list(sorted_importances.items())[:10], 1):
        print(f"    {i:2d}. {fname:<26} : {imp:+.4f}")
        
    return champion_model, best_model_name, results, sorted_importances


def save_artifacts(champion_model: Any, champion_name: str, metrics: Dict[str, Any], importances: Dict[str, float]):
    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(BACKEND_ML_DIR, exist_ok=True)
    
    model_artifact = {
        "model": champion_model,
        "algorithm": champion_name,
        "feature_names": FEATURE_NAMES,
        "version": "v1.0.0",
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    
    # Save to ml/model
    model_path = os.path.join(MODEL_DIR, "phishing_model.joblib")
    joblib.dump(model_artifact, model_path, compress=3)
    print(f"\n[+] Champion model saved to: {model_path} ({os.path.getsize(model_path):,} bytes)")
    
    # Save copy to backend/app/ml for instant runtime loading
    backend_model_path = os.path.join(BACKEND_ML_DIR, "phishing_model.joblib")
    joblib.dump(model_artifact, backend_model_path, compress=3)
    print(f"[+] Runtime model exported to backend: {backend_model_path}")
    
    # Save detailed metrics JSON
    metrics_data = {
        "model_name": "PhiUSIIL-URL-Detector",
        "version": "v1.0.0",
        "champion_algorithm": champion_name,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "features": FEATURE_NAMES,
        "feature_importances": importances,
        "benchmarks": metrics
    }
    
    metrics_path = os.path.join(MODEL_DIR, "model_metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=2)
    print(f"[+] Comprehensive metrics written to: {metrics_path}")
    
    # Update SQLite database model_versions table
    if os.path.exists(DB_PATH):
        try:
            champ_metrics = metrics[champion_name]
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("""
                UPDATE model_versions
                SET algorithm = ?, accuracy = ?, precision_score = ?, recall_score = ?, f1_score = ?
                WHERE version = 'v1.0.0'
            """, (
                champion_name,
                champ_metrics["accuracy"],
                champ_metrics["precision"],
                champ_metrics["recall"],
                champ_metrics["f1_score"]
            ))
            conn.commit()
            conn.close()
            print(f"[+] Updated SQLite model_versions table with live champion evaluation metrics.")
        except Exception as e:
            print(f"[-] Warning: Failed to update SQLite model_versions table: {e}")


def main():
    X, y, _ = load_and_preprocess_data(sample_size=100000)
    champion_model, champion_name, metrics, importances = train_and_evaluate_models(X, y)
    save_artifacts(champion_model, champion_name, metrics, importances)
    print("\n[+] Stage 2 Machine Learning Training & Model Serialization Complete!\n")


if __name__ == "__main__":
    main()
