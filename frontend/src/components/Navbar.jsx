import React, { useState, useEffect } from 'react';
import { Shield, Activity, History, BookOpen, User, LogOut, Lock, Terminal, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout, openLogin, openRegister } = useAuth();
  const [healthStatus, setHealthStatus] = useState('ONLINE');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    api.getHealth()
      .then((h) => setHealthStatus(h.status || 'ONLINE'))
      .catch(() => setHealthStatus('DEGRADED'));
  }, []);

  const navItems = [
    { id: 'scanner', label: 'AI Scanner', icon: Shield },
    { id: 'dashboard', label: 'Threat Analytics', icon: Activity },
    { id: 'history', label: 'Scan Logs', icon: History },
    { id: 'education', label: 'Security Hub', icon: BookOpen },
  ];

  if (user && user.role === 'ADMIN') {
    navItems.push({ id: 'admin', label: 'Admin Panel', icon: Terminal });
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(7, 10, 19, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 74 }}>
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('scanner')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(99, 102, 241, 0.3) 100%)',
              border: '1px solid var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)',
            }}
          >
            <Shield size={24} color="var(--accent-cyan)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }} className="gradient-text">
                PhishShield
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'rgba(0, 242, 254, 0.15)',
                  border: '1px solid rgba(0, 242, 254, 0.3)',
                  color: 'var(--accent-cyan)',
                  letterSpacing: '0.05em',
                }}
              >
                AI v1.0
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Intelligent Phishing Detection
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav style={{ display: 'none', mdDisplay: 'flex', gap: 6, alignItems: 'center' }} className="desktop-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--accent-cyan)' : 'transparent',
                  background: isActive ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right side: Health & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Health indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.75rem',
              color: '#34d399',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: healthStatus === 'ONLINE' ? '#10b981' : '#f59e0b',
                boxShadow: healthStatus === 'ONLINE' ? '0 0 8px #10b981' : '0 0 8px #f59e0b',
                display: 'inline-block',
              }}
            />
            {healthStatus}
          </div>

          {/* User Auth controls */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <User size={15} color="var(--accent-cyan)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
                {user.role === 'ADMIN' && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#f87171',
                      padding: '1px 5px',
                      borderRadius: 4,
                    }}
                  >
                    ADMIN
                  </span>
                )}
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="btn btn-secondary"
                style={{ padding: '8px 12px' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={openLogin}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Sign In
              </button>
              <button
                onClick={openRegister}
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-color)',
            background: 'rgba(7, 10, 19, 0.98)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
