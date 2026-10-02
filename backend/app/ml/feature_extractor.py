"""
URL Static Feature Extractor
AI-Based Phishing Website Detection System

Performs strictly static lexical, structural, and domain-level feature extraction
directly from a URL string without sending any outbound HTTP or network requests.
"""

import math
import re
from typing import Any, Dict, List
from urllib.parse import parse_qs, urlparse

# Common URL shortener domains
SHORTENER_DOMAINS = {
    "bit.ly", "tinyurl.com", "goo.gl", "ow.ly", "t.co", "is.gd",
    "buff.ly", "adf.ly", "tiny.cc", "lnkd.in", "db.tt", "qr.ae",
    "cur.lv", "ity.im", "q.gs", "po.st", "bc.vc", "twitthis.com",
    "u.to", "j.mp", "buzurl.com", "cutt.ly", "rebrand.ly", "shorturl.at"
}

# Suspicious keywords commonly seen in phishing attack URLs
SUSPICIOUS_KEYWORDS = [
    "login", "signin", "verify", "verification", "account", "update",
    "secure", "banking", "authenticate", "confirm", "wallet", "password",
    "credential", "suspend", "unlock", "recover", "validate", "support",
    "paypal", "appleid", "netflix", "microsoft", "amazon", "chase",
    "wells", "fargo", "security", "webscr", "ebayisapi", "cmd=_login"
]

# IPv4 address regex pattern
IPV4_PATTERN = re.compile(
    r"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
)

# Feature names in the exact order expected by the ML model
FEATURE_NAMES = [
    "url_length",
    "domain_length",
    "subdomain_count",
    "dot_count",
    "hyphen_count",
    "digit_count",
    "special_character_count",
    "has_ip",
    "has_https",
    "has_at_symbol",
    "suspicious_keyword_count",
    "url_shortener_detected",
    "parameter_count",
    "path_segment_count",
    "domain_entropy",
    "digit_ratio",
    "letter_ratio",
    "has_double_slash_in_path",
    "tld_length"
]


def normalize_url(url: str) -> str:
    """
    Normalizes a URL string for consistent parsing and processing.
    Ensures scheme exists, strips leading/trailing whitespaces, lowercases scheme & host.
    """
    if not url:
        return ""
    
    clean_url = url.strip()
    if not (clean_url.lower().startswith("http://") or clean_url.lower().startswith("https://")):
        clean_url = "http://" + clean_url
        
    try:
        parsed = urlparse(clean_url)
        scheme = parsed.scheme.lower()
        netloc = parsed.netloc.lower()
        path = parsed.path if parsed.path else "/"
        query = f"?{parsed.query}" if parsed.query else ""
        fragment = f"#{parsed.fragment}" if parsed.fragment else ""
        return f"{scheme}://{netloc}{path}{query}{fragment}"
    except Exception:
        return clean_url


def calculate_entropy(text: str) -> float:
    """Calculates the Shannon entropy of a given string."""
    if not text:
        return 0.0
    text_len = len(text)
    prob_dict: Dict[str, int] = {}
    for char in text:
        prob_dict[char] = prob_dict.get(char, 0) + 1
    
    entropy = 0.0
    for count in prob_dict.values():
        p = count / text_len
        entropy -= p * math.log2(p)
    return round(entropy, 4)


class FeatureExtractor:
    """
    Extracts numerical and categorical static features from URLs for machine learning inference
    and database persistence. Zero external network I/O.
    """

    @staticmethod
    def extract_features(raw_url: str) -> Dict[str, Any]:
        normalized = normalize_url(raw_url)
        parsed = urlparse(normalized)
        
        netloc = parsed.netloc
        host = netloc.split(":")[0] if ":" in netloc else netloc
        domain_core = host[4:] if host.startswith("www.") else host
        
        url_length = len(normalized)
        domain_length = len(host)
        
        # Check IP
        has_ip = 1 if bool(IPV4_PATTERN.match(host)) else 0
        
        # Subdomains & TLD
        host_parts = host.split(".")
        if has_ip:
            subdomain_count = 0
            tld_length = 0
        elif len(host_parts) > 2:
            subdomain_parts = [p for p in host_parts[:-2] if p != "www"]
            subdomain_count = max(0, len(subdomain_parts))
            tld = host_parts[-1]
            tld_length = len(tld)
        else:
            subdomain_count = 0
            tld = host_parts[-1] if len(host_parts) > 1 else ""
            tld_length = len(tld)
            
        dot_count = normalized.count(".")
        hyphen_count = normalized.count("-")
        
        digit_count = sum(c.isdigit() for c in normalized)
        digit_ratio = round(digit_count / url_length, 4) if url_length > 0 else 0.0
        
        letter_count = sum(c.isalpha() for c in normalized)
        letter_ratio = round(letter_count / url_length, 4) if url_length > 0 else 0.0
        
        standard_chars = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:/?=.&-")
        special_character_count = sum(1 for c in normalized if c not in standard_chars)
        
        has_https = 1 if parsed.scheme == "https" else 0
        has_at_symbol = 1 if "@" in normalized else 0
        
        lower_url = normalized.lower()
        suspicious_keyword_count = sum(1 for kw in SUSPICIOUS_KEYWORDS if kw in lower_url)
        
        url_shortener_detected = 1 if (host in SHORTENER_DOMAINS or domain_core in SHORTENER_DOMAINS) else 0
        
        query_params = parse_qs(parsed.query)
        parameter_count = len(query_params)
        
        path_segments = [seg for seg in parsed.path.split("/") if seg]
        path_segment_count = len(path_segments)
        
        domain_entropy = calculate_entropy(domain_core)
        has_double_slash_in_path = 1 if "//" in parsed.path else 0
        
        return {
            "normalized_url": normalized,
            "url_length": url_length,
            "domain_length": domain_length,
            "subdomain_count": subdomain_count,
            "dot_count": dot_count,
            "hyphen_count": hyphen_count,
            "digit_count": digit_count,
            "special_character_count": special_character_count,
            "has_ip": has_ip,
            "has_https": has_https,
            "has_at_symbol": has_at_symbol,
            "suspicious_keyword_count": suspicious_keyword_count,
            "url_shortener_detected": url_shortener_detected,
            "parameter_count": parameter_count,
            "path_segment_count": path_segment_count,
            "domain_entropy": domain_entropy,
            "digit_ratio": digit_ratio,
            "letter_ratio": letter_ratio,
            "has_double_slash_in_path": has_double_slash_in_path,
            "tld_length": tld_length
        }

    @staticmethod
    def extract_vector(raw_url: str) -> List[float]:
        """Extracts features and returns an ordered numerical vector matching FEATURE_NAMES."""
        feats = FeatureExtractor.extract_features(raw_url)
        return [float(feats[name]) for name in FEATURE_NAMES]
