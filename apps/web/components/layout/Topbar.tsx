'use client';
import { Bell, Search, HelpCircle, Shield } from 'lucide-react';
import { MOCK_ALERTS } from '@/lib/mock-data';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const unreadAlerts = MOCK_ALERTS.filter(a => !a.acknowledged).length;

  return (
    <div className="topbar">
      {/* Page title */}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, marginTop: 1 }}>{subtitle}</p>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', width: 240 }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search experiments..."
          style={{
            width: '100%',
            padding: '7px 12px 7px 32px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            color: 'var(--text-primary)',
            fontSize: 13,
            outline: 'none',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-cyan)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
        />
      </div>

      {/* Safety Badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 12px',
        background: 'rgba(16,185,129,0.08)',
        border: '1px solid rgba(16,185,129,0.25)',
        borderRadius: 8,
        fontSize: 12, fontWeight: 600, color: 'var(--accent-green)',
      }}>
        <Shield size={13} strokeWidth={2.5} />
        IEEE 1584
      </div>

      {/* Notifications */}
      <button
        aria-label="Notifications"
        style={{
          position: 'relative',
          width: 36, height: 36,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--accent-cyan-dim)';
          e.currentTarget.style.borderColor = 'var(--accent-cyan)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
        }}
      >
        <Bell size={16} style={{ color: 'var(--text-secondary)' }} />
        {unreadAlerts > 0 && (
          <span style={{
            position: 'absolute', top: 5, right: 5,
            width: 8, height: 8,
            background: 'var(--accent-red)',
            borderRadius: '50%',
            border: '1.5px solid var(--bg-primary)',
          }} />
        )}
      </button>

      {/* Help */}
      <button
        aria-label="Help"
        style={{
          width: 36, height: 36,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--accent-cyan-dim)';
          e.currentTarget.style.borderColor = 'var(--accent-cyan)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
        }}
      >
        <HelpCircle size={16} style={{ color: 'var(--text-secondary)' }} />
      </button>
    </div>
  );
}
