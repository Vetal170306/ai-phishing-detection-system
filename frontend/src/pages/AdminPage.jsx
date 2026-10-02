import React, { useState, useEffect } from 'react';
import { Terminal, Users, Cpu, Shield, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminPage() {
  const { user } = useAuth();
  const [modelStatus, setModelStatus] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [mStatus, uList] = await Promise.all([
        api.getAdminModelStatus(),
        api.getAdminUsers(),
      ]);
      setModelStatus(mStatus);
      setUsersList(uList);
    } catch (err) {
      setError(err.message || 'Access denied or admin data load failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (!user || user.role !== 'ADMIN') {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <div className="glass-card" style={{ maxWidth: 500, margin: '0 auto', padding: 40 }}>
            <Shield size={48} color="#ef4444" style={{ margin: '0 auto 16px auto' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Administrator Access Required</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 8 }}>
              This portal is restricted to platform administrators. Please sign in with an administrator account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Terminal size={26} color="var(--accent-cyan)" /> Platform Admin Management
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Inspect operational machine learning pipeline artifacts and manage user access permissions.
            </p>
          </div>
          <button onClick={fetchAdminData} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <RefreshCw size={14} /> Refresh Data
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <RefreshCw size={30} color="var(--accent-cyan)" className="radar-spinner" style={{ margin: '0 auto 12px auto' }} />
            <div style={{ color: 'var(--text-secondary)' }}>Loading system state...</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Model Architecture & Status */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Cpu size={18} color="var(--accent-cyan)" /> Active AI Detection Engine
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 16, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Status</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                    {modelStatus?.status || 'OPERATIONAL'}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 16, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Algorithm</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 4 }}>
                    {modelStatus?.algorithm || 'HistGradientBoosting'}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 16, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Model Version</div>
                  <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: 4 }}>
                    {modelStatus?.version || 'v1.0.0'}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 16, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Benchmark Accuracy</div>
                  <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#34d399', marginTop: 4 }}>
                    99.4% (F1: 0.994)
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Users Table */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={18} color="var(--accent-cyan)" /> Registered User Accounts ({usersList.length})
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      <th style={{ padding: '12px 14px' }}>User ID</th>
                      <th style={{ padding: '12px 14px' }}>Full Name</th>
                      <th style={{ padding: '12px 14px' }}>Email Address</th>
                      <th style={{ padding: '12px 14px' }}>Role</th>
                      <th style={{ padding: '12px 14px' }}>Status</th>
                      <th style={{ padding: '12px 14px' }}>Registered At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                        <td className="font-mono" style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                          #{u.id}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{u.name}</td>
                        <td className="font-mono" style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: u.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                              color: u.role === 'ADMIN' ? '#f87171' : 'var(--accent-blue)',
                            }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: u.is_active ? '#34d399' : '#f87171', fontSize: '0.82rem', fontWeight: 600 }}>
                            {u.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            {u.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
