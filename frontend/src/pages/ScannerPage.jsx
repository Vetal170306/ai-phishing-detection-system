import React, { useState } from 'react';
import { Search, Shield, Zap, AlertTriangle, Layers, Copy, Check, ArrowRight, CornerDownLeft, Sparkles, RefreshCw } from 'lucide-react';
import RiskGauge from '../components/RiskGauge';
import ThreatBadges from '../components/ThreatBadges';
import { api } from '../services/api';

export default function ScannerPage() {
  const [mode, setMode] = useState('single'); // 'single' or 'batch'
  const [url, setUrl] = useState('');
  const [batchUrls, setBatchUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const sampleUrls = [
    { label: 'Legitimate Bank', url: 'https://www.chase.com/personal/banking', type: 'safe' },
    { label: 'Deceptive IP Address', url: 'http://192.168.1.105/secure-login/verify.html', type: 'phish' },
    { label: 'Lookalike Subdomain', url: 'https://paypal.com.account-update-security.xyz/login', type: 'phish' },
    { label: 'Unencrypted HTTP', url: 'http://myuniversity-portal.edu/student-login', type: 'suspicious' },
  ];

  const handleScan = async (e) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const data = await api.scanUrl(url.trim());
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to scan URL. Please verify format.');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchScan = async (e) => {
    if (e) e.preventDefault();
    const urls = batchUrls
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (urls.length === 0) return;

    setError('');
    setLoading(true);
    setBatchResult(null);

    try {
      const data = await api.scanBatch(urls);
      setBatchResult(data);
    } catch (err) {
      setError(err.message || 'Batch scan failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = () => {
    if (!result?.url) return;
    navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        {/* Hero Section */}
        <div style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto 40px auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(0, 242, 254, 0.08)',
              border: '1px solid rgba(0, 242, 254, 0.25)',
              fontSize: '0.85rem',
              color: 'var(--accent-cyan)',
              marginBottom: 16,
            }}
          >
            <Sparkles size={16} />
            <span>Real-Time Static Machine Learning Scanner</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
            Detect Malicious & Phishing URLs <span className="gradient-text">Instantly with AI</span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            PhishShield performs sub-millisecond static lexical & entropy feature extraction on target URLs to predict phishing attacks with <strong>zero outbound risk</strong>.
          </p>

          {/* Mode Switcher */}
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-md)',
              padding: 4,
              marginTop: 24,
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              onClick={() => { setMode('single'); setError(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 20px',
                borderRadius: 8,
                border: 'none',
                background: mode === 'single' ? 'var(--accent-cyan)' : 'transparent',
                color: mode === 'single' ? '#050b14' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Zap size={16} /> Single URL
            </button>
            <button
              onClick={() => { setMode('batch'); setError(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 20px',
                borderRadius: 8,
                border: 'none',
                background: mode === 'batch' ? 'var(--accent-cyan)' : 'transparent',
                color: mode === 'batch' ? '#050b14' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Layers size={16} /> Batch Analysis
            </button>
          </div>
        </div>

        {/* Input Card */}
        <div
          className="glass-card"
          style={{
            maxWidth: 880,
            margin: '0 auto 30px auto',
            padding: 24,
            boxShadow: 'var(--shadow-glow-cyan)',
          }}
        >
          {mode === 'single' ? (
            <form onSubmit={handleScan}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 280 }}>
                  <Search
                    size={20}
                    color="var(--accent-cyan)"
                    style={{ position: 'absolute', left: 16, top: 16 }}
                  />
                  <input
                    type="text"
                    placeholder="Enter URL to inspect (e.g. https://secure-login.bank.com)..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="form-input font-mono"
                    style={{ paddingLeft: 48, fontSize: '0.95rem' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="btn btn-primary"
                  style={{ padding: '14px 28px', fontSize: '1rem' }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className="radar-spinner" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Shield size={18} /> Inspect URL
                    </>
                  )}
                </button>
              </div>

              {/* Sample Presets */}
              <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Try Sample:</span>
                {sampleUrls.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setUrl(s.url); }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-color)',
                      color: s.type === 'phish' ? '#f87171' : s.type === 'suspicious' ? '#fbbf24' : '#34d399',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </form>
          ) : (
            <form onSubmit={handleBatchScan}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                Paste multiple URLs (one URL per line, max 20):
              </label>
              <textarea
                rows={5}
                placeholder="https://example.com&#10;http://192.168.1.1/login&#10;https://bank-security.xyz"
                value={batchUrls}
                onChange={(e) => setBatchUrls(e.target.value)}
                className="form-input font-mono"
                style={{ width: '100%', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                <button
                  type="submit"
                  disabled={loading || !batchUrls.trim()}
                  className="btn btn-primary"
                  style={{ padding: '12px 24px' }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className="radar-spinner" /> Batch Scanning...
                    </>
                  ) : (
                    <>
                      <Layers size={18} /> Run Batch Scan
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {error && (
            <div
              style={{
                marginTop: 16,
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Loading Radar Animation */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div
              style={{
                width: 100,
                height: 100,
                margin: '0 auto 20px auto',
                borderRadius: '50%',
                border: '2px solid rgba(0, 242, 254, 0.2)',
                borderTopColor: 'var(--accent-cyan)',
                animation: 'scan-radar 1.2s linear infinite',
              }}
            />
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
              Executing Static Lexical & Entropy Analysis...
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Extracting 18+ URL dimensions and querying trained classifier
            </div>
          </div>
        )}

        {/* Single Scan Results Section */}
        {result && !loading && (
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div
              className="glass-card"
              style={{
                padding: 32,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 36,
                alignItems: 'start',
              }}
            >
              {/* Left Column: Gauge & Prediction */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <RiskGauge
                  score={result.risk_score}
                  riskLevel={result.risk_level}
                  prediction={result.prediction}
                  confidence={result.confidence}
                />

                {/* URL summary pill */}
                <div
                  className="glass-panel"
                  style={{
                    width: '100%',
                    marginTop: 24,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Normalized Target</div>
                    <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {result.normalized_url}
                    </div>
                  </div>
                  <button
                    onClick={copyUrl}
                    title="Copy URL"
                    className="btn btn-secondary"
                    style={{ padding: 6, minWidth: 32, height: 32 }}
                  >
                    {copied ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Right Column: Threats & Indicators */}
              <div>
                <ThreatBadges
                  warnings={result.warning_signs}
                  safeIndicators={result.safe_indicators}
                  features={result.features}
                  algorithm={result.algorithm}
                  modelVersion={result.model_version}
                />
              </div>
            </div>
          </div>
        )}

        {/* Batch Scan Results Section */}
        {batchResult && !loading && (
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            {/* Batch summary card */}
            <div
              className="glass-card"
              style={{
                padding: 24,
                marginBottom: 24,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 16,
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Evaluated</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{batchResult.total_scanned}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#f87171' }}>Phishing Found</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171' }}>{batchResult.phishing_detected}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#fbbf24' }}>Suspicious</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>{batchResult.suspicious_detected}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#34d399' }}>Legitimate</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>{batchResult.legitimate_detected}</div>
              </div>
            </div>

            {/* Results Table */}
            <div className="glass-card" style={{ padding: 20, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    <th style={{ padding: '12px 14px' }}>Target URL</th>
                    <th style={{ padding: '12px 14px' }}>Verdict</th>
                    <th style={{ padding: '12px 14px' }}>Risk Score</th>
                    <th style={{ padding: '12px 14px' }}>Top Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {batchResult.results.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                      <td className="font-mono" style={{ padding: '12px 14px', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.url}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge badge-${r.prediction.toLowerCase()}`}>
                          {r.prediction}
                        </span>
                      </td>
                      <td className="font-mono" style={{ padding: '12px 14px', fontWeight: 700 }}>
                        {r.risk_score} / 100
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {r.warning_signs && r.warning_signs[0] ? r.warning_signs[0].title : 'None'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
