import React, { useState, useEffect } from 'react';
import { History, Search, Filter, RefreshCw, Eye, X, ShieldAlert, ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import RiskGauge from '../components/RiskGauge';
import ThreatBadges from '../components/ThreatBadges';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScan, setSelectedScan] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getScanHistory(page, 10, filter);
      setHistory(data.items || []);
      setTotalPages(data.total_pages || 1);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, filter]);

  const handleInspect = async (scanId) => {
    setDetailLoading(true);
    setSelectedScan(null);
    try {
      const data = await api.getScanDetail(scanId);
      setSelectedScan(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredItems = history.filter((item) =>
    item.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        {/* Title */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
            Security Audit <span className="gradient-text">Scan History</span>
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Historical record of evaluated URLs, model verdicts, and calibrated threat scores.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div
          className="glass-card"
          style={{
            padding: 16,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          {/* Classification Filter Tabs */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { id: '', label: 'All Scans' },
              { id: 'PHISHING', label: 'Phishing', color: '#f87171' },
              { id: 'SUSPICIOUS', label: 'Suspicious', color: '#fbbf24' },
              { id: 'LEGITIMATE', label: 'Legitimate', color: '#34d399' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setFilter(tab.id); setPage(1); }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: filter === tab.id ? 'var(--accent-cyan)' : 'transparent',
                  background: filter === tab.id ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: tab.color || (filter === tab.id ? 'var(--accent-cyan)' : 'var(--text-secondary)'),
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Query */}
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type="text"
              placeholder="Search by URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input font-mono"
              style={{ padding: '8px 12px 8px 36px', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* History Table */}
        <div className="glass-card" style={{ padding: 24, overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <RefreshCw size={28} color="var(--accent-cyan)" className="radar-spinner" style={{ margin: '0 auto 12px auto' }} />
              <div style={{ color: 'var(--text-secondary)' }}>Loading scan logs...</div>
            </div>
          ) : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    <th style={{ padding: '12px 14px' }}>Target URL</th>
                    <th style={{ padding: '12px 14px' }}>Verdict</th>
                    <th style={{ padding: '12px 14px' }}>Risk Score</th>
                    <th style={{ padding: '12px 14px' }}>Confidence</th>
                    <th style={{ padding: '12px 14px' }}>Analyzed At</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems && filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                        <td className="font-mono" style={{ padding: '14px', maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.url}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span className={`badge badge-${item.prediction.toLowerCase()}`}>
                            {item.prediction}
                          </span>
                        </td>
                        <td className="font-mono" style={{ padding: '14px', fontWeight: 700 }}>
                          {item.risk_score} / 100
                        </td>
                        <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                          {(item.confidence * 100).toFixed(1)}%
                        </td>
                        <td style={{ padding: '14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(item.created_at).toLocaleString()}
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleInspect(item.id)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            <Eye size={14} /> Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No records match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                }}
              >
                <div>
                  Page {page} of {totalPages} ({totalCount} total scans)
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    <ArrowLeft size={14} /> Prev
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    Next <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Scan Detail Modal */}
        {(selectedScan || detailLoading) && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => setSelectedScan(null)}
          >
            <div
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: 800,
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: 32,
                background: 'rgba(13, 19, 34, 0.98)',
                border: '1px solid var(--border-color-glow)',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedScan(null)}
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>

              {detailLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <RefreshCw size={28} className="radar-spinner" color="var(--accent-cyan)" />
                </div>
              ) : selectedScan ? (
                <div>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scan Record #{selectedScan.id}</div>
                    <h3 className="font-mono" style={{ fontSize: '1.2rem', wordBreak: 'break-all', marginTop: 4 }}>
                      {selectedScan.url}
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginBottom: 24 }}>
                    <RiskGauge
                      score={selectedScan.risk_score}
                      riskLevel={selectedScan.risk_level}
                      prediction={selectedScan.prediction}
                      confidence={selectedScan.confidence}
                    />
                    <ThreatBadges
                      warnings={selectedScan.warning_signs}
                      safeIndicators={selectedScan.safe_indicators}
                      features={selectedScan.features}
                      algorithm={selectedScan.algorithm}
                      modelVersion={selectedScan.model_version}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
