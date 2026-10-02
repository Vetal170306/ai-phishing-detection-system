"""
Machine Learning Inference & Explainability Engine
AI-Based Phishing Website Detection System

Loads the trained scikit-learn classifier pipeline, performs sub-millisecond static
inference on target URLs, and correlates feature indicators to generate calibrated
risk scores (0-100) and actionable, human-explainable security warning signs.
"""

import os
from typing import Any, Dict, List, Optional, Tuple
import joblib

from backend.app.core.config import settings
from backend.app.ml.feature_extractor import FEATURE_NAMES, FeatureExtractor


class PhishingPredictor:
    """
    Singleton inference engine maintaining the trained model in memory.
    """
    _instance: Optional["PhishingPredictor"] = None

    def __init__(self):
        self.model = None
        self.algorithm = "HistGradientBoosting Classifier"
        self.version = "v1.0.0"
        self.load_model()

    @classmethod
    def get_instance(cls) -> "PhishingPredictor":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_model(self):
        model_path = settings.MODEL_PATH
        if os.path.exists(model_path):
            try:
                artifact = joblib.load(model_path)
                if isinstance(artifact, dict) and "model" in artifact:
                    self.model = artifact["model"]
                    self.algorithm = artifact.get("algorithm", self.algorithm)
                    self.version = artifact.get("version", self.version)
                else:
                    self.model = artifact
                print(f"[+] Loaded ML model from {model_path} ({self.algorithm} {self.version})")
            except Exception as e:
                print(f"[-] Error loading model from {model_path}: {e}")
                self.model = None
        else:
            print(f"[!] Warning: Model file not found at {model_path}. Inference will use fallback heuristic rules.")
            self.model = None

    def generate_explanations(self, features: Dict[str, Any], risk_score: int) -> Tuple[List[Dict[str, str]], List[Dict[str, str]]]:
        warnings: List[Dict[str, str]] = []
        safe_indicators: List[Dict[str, str]] = []

        # 1. IP Address Check
        if features["has_ip"] == 1:
            warnings.append({
                "severity": "CRITICAL",
                "title": "Raw IP Address as Hostname",
                "description": "The URL connects directly to an IP address rather than a verified domain name, a hallmark of evasion in phishing campaigns."
            })

        # 2. HTTPS Check
        if features["has_https"] == 0:
            warnings.append({
                "severity": "HIGH",
                "title": "Missing HTTPS Encryption",
                "description": "Connection is unencrypted HTTP, leaving any transmitted passwords or personal details vulnerable to interception."
            })
        else:
            safe_indicators.append({
                "title": "HTTPS Enforced",
                "description": "URL uses SSL/TLS transport encryption."
            })

        # 3. Credentials Divider (@)
        if features["has_at_symbol"] == 1:
            warnings.append({
                "severity": "HIGH",
                "title": "Credentials Divider (@) Present",
                "description": "The '@' character can trick browsers into ignoring preceding characters to disguise the true host destination."
            })

        # 4. Suspicious Keywords
        kw_count = features["suspicious_keyword_count"]
        if kw_count > 0:
            severity = "HIGH" if kw_count >= 2 else "MEDIUM"
            warnings.append({
                "severity": severity,
                "title": f"Phishing Keywords Detected ({kw_count})",
                "description": f"URL path/query contains {kw_count} sensitive terms (e.g. login, verify, account, secure) commonly used in credential harvesting."
            })
        else:
            safe_indicators.append({
                "title": "Zero Credential Traps",
                "description": "No typical phishing keyword triggers identified in the URL string."
            })

        # 5. Excessive Subdomains
        sub_count = features["subdomain_count"]
        if sub_count >= 3:
            warnings.append({
                "severity": "MEDIUM",
                "title": f"Excessive Subdomains ({sub_count})",
                "description": "Deep subdomain nesting is frequently utilized to forge complex lookalike hierarchies imitating reputable brands."
            })
        elif sub_count <= 1:
            safe_indicators.append({
                "title": "Standard Subdomain Hierarchy",
                "description": "Host domain conforms to standard single-level or top-level hierarchy."
            })

        # 6. URL Shortener
        if features["url_shortener_detected"] == 1:
            warnings.append({
                "severity": "MEDIUM",
                "title": "URL Shortening Service",
                "description": "Domain matches known link shortening services (e.g. bit.ly, tinyurl), masking the actual destination server."
            })

        # 7. Hyphen stuffing
        hyphen_count = features["hyphen_count"]
        if hyphen_count >= 3:
            warnings.append({
                "severity": "MEDIUM",
                "title": f"Multiple Hyphens in URL ({hyphen_count})",
                "description": "Frequent hyphens are common in lookalike typo-squatted domains mimicking official brands."
            })

        # 8. High Domain Entropy
        entropy = features["domain_entropy"]
        if entropy >= 3.8 and features["domain_length"] > 10:
            warnings.append({
                "severity": "MEDIUM",
                "title": f"High Domain Randomness / Entropy ({entropy:.2f})",
                "description": "High character entropy suggests algorithmic domain generation (DGA) or intentional obfuscation."
            })

        # 9. Excessive URL length
        if features["url_length"] > 100:
            warnings.append({
                "severity": "LOW",
                "title": f"Abnormal URL Length ({features['url_length']} chars)",
                "description": "Unusually long URLs are often used to pack obfuscated tracking payloads and redirection tokens."
            })

        # 10. Double Slash in Path
        if features["has_double_slash_in_path"] == 1:
            warnings.append({
                "severity": "HIGH",
                "title": "Double Slash (//) Path Redirection",
                "description": "Consecutive slashes in URL path can trigger client-side redirect bypasses."
            })

        return warnings, safe_indicators

    def predict(self, url: str) -> Dict[str, Any]:
        """
        Performs end-to-end static feature extraction, model inference,
        risk calibration, and explainability breakdown.
        """
        features = FeatureExtractor.extract_features(url)
        vector = [float(features[name]) for name in FEATURE_NAMES]

        # ML Model Inference
        if self.model is not None:
            try:
                # predict_proba returns [P(legit), P(phishing)]
                proba = self.model.predict_proba([vector])[0]
                phishing_prob = float(proba[1])
            except Exception as e:
                print(f"[-] Inference error: {e}, using heuristic fallback")
                phishing_prob = self._heuristic_fallback(features)
        else:
            phishing_prob = self._heuristic_fallback(features)

        # Risk calibration: continuous score 0 to 100
        risk_score = int(round(phishing_prob * 100))
        risk_score = max(0, min(100, risk_score))

        # Classification label & risk level mapping
        if risk_score <= 35:
            prediction = "LEGITIMATE"
            risk_level = "LOW"
            confidence = round(1.0 - phishing_prob, 4)
        elif risk_score <= 70:
            prediction = "SUSPICIOUS"
            risk_level = "MEDIUM"
            confidence = round(max(phishing_prob, 1.0 - phishing_prob), 4)
        else:
            prediction = "PHISHING"
            risk_level = "HIGH"
            confidence = round(phishing_prob, 4)

        warnings, safe_indicators = self.generate_explanations(features, risk_score)

        return {
            "url": url,
            "normalized_url": features["normalized_url"],
            "prediction": prediction,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "confidence": confidence,
            "phishing_probability": round(phishing_prob, 4),
            "features": features,
            "warning_signs": warnings,
            "safe_indicators": safe_indicators,
            "algorithm": self.algorithm,
            "model_version": self.version
        }

    def _heuristic_fallback(self, f: Dict[str, Any]) -> float:
        """Heuristic risk probability fallback when ML model file is unavailable."""
        score = 0.05
        if f["has_ip"]:
            score += 0.40
        if not f["has_https"]:
            score += 0.20
        if f["has_at_symbol"]:
            score += 0.25
        if f["suspicious_keyword_count"] > 0:
            score += min(0.35, f["suspicious_keyword_count"] * 0.15)
        if f["url_shortener_detected"]:
            score += 0.15
        if f["subdomain_count"] >= 3:
            score += 0.15
        if f["domain_entropy"] >= 3.8:
            score += 0.10
        return min(0.99, score)


# Global singleton
predictor = PhishingPredictor.get_instance()
