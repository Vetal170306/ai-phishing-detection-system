import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, ShieldCheck, AlertTriangle, TrendingUp, BarChart3, Clock, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function DashboardPage({ setActiveTab }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <RefreshCw size={36} color="var(--accent-cyan)" className="radar-spinner" style={{ margin: '0 auto 16px auto' }} />
        <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Loading Threat Analytics...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
              Global Threat <span className="gradient-text">Analytics & Intelligence</span>
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Real-time telemetry aggregated from static URL security inspections.
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} /> Refresh Metrics
          </button>
        </div>

        {/* KPI Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
          {/* Card 1: Total Scans */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL EVALUATIONS</span>
              <Activity size={18} color="var(--accent-cyan)" />
            </div>
            <div className="font-mono" style={{ fontSize: '2.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>
              {stats?.total_scans || 0}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Processed by ML Classifier
            </div>
          </div>

          {/* Card 2: Phishing Detected */}
          <div className="glass-card" style={{ padding: 24, borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f87171' }}>PHISHING IDENTIFIED</span>
              <ShieldAlert size={18} color="#ef4444" />
            </div>
            <div className="font-mono" style={{ fontSize: '2.4rem', fontWeight: 800, margin: '8px 0 4px 0', color: '#f87171' }}>
              {stats?.total_phishing || 0}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {stats?.phishing_rate || 0}% overall threat rate
            </div>
          </div>

          {/* Card 3: Suspicious */}
          <div className="glass-card" style={{ padding: 24, borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fbbf24' }}>SUSPICIOUS ANOMALIES</span>
              <AlertTriangle size={18} color="#f59e0b" />
            </div>
            <div className="font-mono" style={{ fontSize: '2.4rem', fontWeight: 800, margin: '8px 0 4px 0', color: '#fbbf24' }}>
              {stats?.total_suspicious || 0}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Medium-risk lookalikes
            </div>
          </div>

          {/* Card 4: Legitimate */}
          <div className="glass-card" style={{ padding: 24, borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#34d399' }}>SAFE / LEGITIMATE</span>
              <ShieldCheck size={18} color="#10b981" />
            </div>
            <div className="font-mono" style={{ fontSize: '2.4rem', fontWeight: 800, margin: '8px 0 4px 0', color: '#34d399' }}>
              {stats?.total_legitimate || 0}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Clean domain verified
            </div>
          </div>
        </div>

        {/* Charts and Distributions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 32 }}>
          {/* 7-Day Trend Chart */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={18} color="var(--accent-cyan)" /> 7-Day Threat Activity Trend
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 180, gap: 12, paddingTop: 20 }}>
              {stats?.scan_trends_7d?.map((day, idx) => {
                const maxTotal = Math.max(...(stats.scan_trends_7d.map(d => d.total) || [1]), 1);
                const heightPct = Math.max((day.total / maxTotal) * 100, 8);
                const phishPct = day.total > 0 ? (day.phishing / day.total) * 100 : 0;

                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                      {day.total}
                    </div>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 36,
                        height: `${heightPct}%`,
                        background: 'linear-gradient(180deg, var(--accent-cyan) 0%, rgba(0, 242, 254, 0.2) 100%)',
                        borderRadius: '6px 6px 0 0',
                        position: 'relative',
                        transition: 'height 0.5s ease',
                      }}
                    >
                      {/* Phishing portion overlay */}
                      {day.phishing > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: `${phishPct}%`,
                            background: '#ef4444',
                            borderRadius: '6px 6px 0 0',
                          }}
                        />
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                      {day.date}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, background: 'var(--accent-cyan)', borderRadius: 2 }} /> Clean / Suspicious
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: 2 }} /> Phishing
              </span>
            </div>
          </div>

          {/* Top Threat Indicators */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} color="var(--accent-cyan)" /> Most Prevalent Threat Indicators
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {stats?.top_indicators && stats.top_indicators.length > 0 ? (
                stats.top_indicators.map((ind, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                      <span>{ind.name}</span>
                      <span className="font-mono" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        {ind.percentage}% ({ind.count})
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(ind.percentage, 100)}%`,
                          background: 'linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-indigo) 100%)',
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '20px 0' }}>
                  No indicator data recorded yet. Perform URL scans to populate.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Scans Table */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="var(--accent-cyan)" /> Recent Security Scans
            </h3>
            <button
              onClick={() => setActiveTab('history')}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
            >
              View Full History →
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  <th style={{ padding: '10px 12px' }}>Target URL</th>
                  <th style={{ padding: '10px 12px' }}>Verdict</th>
                  <th style={{ padding: '10px 12px' }}>Risk Score</th>
                  <th style={{ padding: '10px 12px' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recent_scans && stats.recent_scans.length > 0 ? (
                  stats.recent_scans.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                      <td className="font-mono" style={{ padding: '12px 12px', maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.url}
                      </td>
                      <td style={{ padding: '12px 12px' }}>
                        <span className={`badge badge-${s.prediction.toLowerCase()}`}>
                          {s.prediction}
                        </span>
                      </td>
                      <td className="font-mono" style={{ padding: '12px 12px', fontWeight: 700 }}>
                        {s.risk_score} / 100
                      </td>
                      <td style={{ padding: '12px 12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(s.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No recent scans recorded. Use the AI Scanner to analyze a URL!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
