import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, ShieldCheck, ChevronDown, ChevronUp, Cpu, Info } from 'lucide-react';

export default function ThreatBadges({ warnings = [], safeIndicators = [], features = {}, algorithm, modelVersion }) {
  const [showFeatures, setShowFeatures] = useState(false);

  const getSeverityStyle = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#f87171', label: 'CRITICAL' };
      case 'HIGH':
        return { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.4)', text: '#fb923c', label: 'HIGH RISK' };
      case 'MEDIUM':
        return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#fbbf24', label: 'WARNING' };
      default:
        return { bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.4)', text: '#38bdf8', label: 'NOTICE' };
    }
  };

  const featureLabels = {
    url_length: 'URL Length (chars)',
    domain_length: 'Domain Length',
    subdomain_count: 'Subdomain Count',
    dot_count: 'Dot (.) Count',
    hyphen_count: 'Hyphen (-) Count',
    digit_count: 'Numeric Digits',
    special_character_count: 'Special Characters',
    has_ip: 'Raw IP Address Host',
    has_https: 'SSL / HTTPS Active',
    has_at_symbol: 'Credentials (@) Divider',
    suspicious_keyword_count: 'Phishing Keywords',
    url_shortener_detected: 'Shortened URL Service',
    parameter_count: 'Query Parameters',
    path_segment_count: 'Path Depth',
    domain_entropy: 'Domain Character Entropy',
    digit_ratio: 'Digit to Char Ratio',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
      {/* Warning Signs */}
      {warnings && warnings.length > 0 && (
        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', color: '#f87171', marginBottom: 12 }}>
            <ShieldAlert size={18} /> Threat Indicators Detected ({warnings.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {warnings.map((w, idx) => {
              const style = getSeverityStyle(w.severity);
              return (
                <div
                  key={idx}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: style.bg,
                    border: `1px solid ${style.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontWeight: 600, color: style.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertTriangle size={15} /> {w.title}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: style.border,
                        color: '#fff',
                      }}
                    >
                      {style.label}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {w.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Safe Indicators */}
      {safeIndicators && safeIndicators.length > 0 && (
        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', color: '#34d399', marginBottom: 12 }}>
            <ShieldCheck size={18} /> Verified Safe Attributes ({safeIndicators.length})
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
            {safeIndicators.map((s, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--status-safe-bg)',
                  border: '1px solid var(--status-safe-border)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                }}
              >
                <CheckCircle size={16} color="#34d399" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399' }}>{s.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Static Feature Matrix Accordion */}
      <div style={{ marginTop: 8 }}>
        <button
          onClick={() => setShowFeatures(!showFeatures)}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'space-between', padding: '10px 16px', fontSize: '0.88rem' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Cpu size={16} color="var(--accent-cyan)" />
            Static Feature Vector ({Object.keys(features || {}).length} URL Metrics)
          </span>
          {showFeatures ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showFeatures && (
          <div
            className="glass-panel"
            style={{
              marginTop: 10,
              padding: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            {Object.entries(features || {}).map(([key, val]) => {
              if (key === 'normalized_url' || key === 'url') return null;
              const formattedVal = typeof val === 'boolean' ? (val ? 'True (1)' : 'False (0)') : (typeof val === 'number' && !Number.isInteger(val) ? val.toFixed(3) : val);
              return (
                <div
                  key={key}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {featureLabels[key] || key}
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                    {String(formattedVal)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Pipeline Info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          padding: '8px 12px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 8,
          border: '1px solid var(--border-subtle)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Info size={14} /> Zero Outbound Request (SSRF Safe)
        </span>
        <span>
          Model: <strong style={{ color: 'var(--accent-cyan)' }}>{algorithm || 'HistGradientBoosting Classifier'}</strong> ({modelVersion || 'v1.0.0'})
        </span>
      </div>
    </div>
  );
}
