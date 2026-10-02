import React from 'react';
import { Shield, Lock, ExternalLink, Heart } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer
      style={{
        marginTop: 80,
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(5, 8, 16, 0.95)',
        padding: '50px 0 30px 0',
      }}
    >
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 40, marginBottom: 40 }}>
        {/* Col 1 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Shield size={22} color="var(--accent-cyan)" />
            <span style={{ fontSize: '1.2rem', fontWeight: 800 }} className="gradient-text">
              PhishShield AI
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Educational and real-time cybersecurity defense system utilizing machine learning static feature extraction to detect malicious URLs and protect online users.
          </p>
        </div>

        {/* Col 2: Navigation */}
        <div>
          <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
            Platform Tools
          </h5>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
            <li>
              <a
                href="#scanner"
                onClick={(e) => { e.preventDefault(); setActiveTab('scanner'); }}
                style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseOver={(e) => e.target.style.color = 'var(--accent-cyan)'}
                onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                URL Static Scanner
              </a>
            </li>
            <li>
              <a
                href="#dashboard"
                onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
                style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseOver={(e) => e.target.style.color = 'var(--accent-cyan)'}
                onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                Threat Analytics & Trends
              </a>
            </li>
            <li>
              <a
                href="#history"
                onClick={(e) => { e.preventDefault(); setActiveTab('history'); }}
                style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseOver={(e) => e.target.style.color = 'var(--accent-cyan)'}
                onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                Scan Audit History
              </a>
            </li>
            <li>
              <a
                href="#education"
                onClick={(e) => { e.preventDefault(); setActiveTab('education'); }}
                style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseOver={(e) => e.target.style.color = 'var(--accent-cyan)'}
                onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                Phishing Education & Quiz
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Security & Safety */}
        <div>
          <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={16} color="var(--status-safe)" /> Safe by Design
          </h5>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            PhishShield processes URLs through <strong>purely static lexical analysis</strong> without executing HTTP network requests to target servers, neutralizing Server-Side Request Forgery (SSRF) and zero-day malware threats.
          </p>
        </div>
      </div>

      <div
        className="container"
        style={{
          paddingTop: 24,
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}
      >
        <div>
          © {new Date().getFullYear()} PhishShield AI System. Built for cybersecurity awareness and research.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span>Argon2id + JWT Security</span>
          <span>•</span>
          <span>Scikit-Learn ML Engine</span>
          <span>•</span>
          <span>Zero-Outbound Execution</span>
        </div>
      </div>
    </footer>
  );
}
