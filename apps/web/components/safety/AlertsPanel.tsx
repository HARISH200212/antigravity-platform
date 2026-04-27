'use client';
import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react';
import type { AlertEvent } from '@/lib/types';
import { MOCK_ALERTS } from '@/lib/mock-data';

const SEVERITY_STYLES = {
  CRITICAL: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)', color: '#ef4444', icon: XCircle },
  WARNING:  { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b', icon: AlertTriangle },
  INFO:     { bg: 'rgba(0,212,255,0.06)',  border: 'rgba(0,212,255,0.2)',  color: '#00d4ff', icon: CheckCircle },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

interface AlertsPanelProps {
  maxItems?: number;
}

export function AlertsPanel({ maxItems = 6 }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<AlertEvent[]>(MOCK_ALERTS);
  const [expanded, setExpanded] = useState<string | null>(null);

  function acknowledge(id: string) {
    setAlerts(prev =>
      prev.map(a => a.id === id ? { ...a, acknowledged: true, acknowledgedAt: new Date().toISOString() } : a)
    );
  }

  const displayAlerts = alerts
    .sort((a, b) => {
      const sev = { CRITICAL: 0, WARNING: 1, INFO: 2 };
      if (!a.acknowledged && b.acknowledged) return -1;
      if (a.acknowledged && !b.acknowledged) return 1;
      return sev[a.severity] - sev[b.severity];
    })
    .slice(0, maxItems);

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '16px 20px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Active Alerts
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {alerts.filter(a => !a.acknowledged).length > 0 && (
            <span className="badge badge-critical">
              {alerts.filter(a => !a.acknowledged).length} unread
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '8px' }}>
        {displayAlerts.map(alert => {
          const style = SEVERITY_STYLES[alert.severity];
          const Icon = style.icon;
          const isExpanded = expanded === alert.id;

          return (
            <div
              key={alert.id}
              style={{
                background: alert.acknowledged ? 'transparent' : style.bg,
                border: `1px solid ${alert.acknowledged ? 'var(--border-subtle)' : style.border}`,
                borderRadius: 8,
                padding: '10px 12px',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                opacity: alert.acknowledged ? 0.55 : 1,
              }}
              onClick={() => setExpanded(isExpanded ? null : alert.id)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <Icon size={15} style={{ color: style.color, flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {alert.title}
                    </span>
                    {!alert.acknowledged && (
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: style.color, flexShrink: 0
                      }} />
                    )}
                  </div>
                  {isExpanded && (
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 8px', lineHeight: 1.5 }}>
                      {alert.message}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={10} />
                      {timeAgo(alert.triggeredAt)}
                    </span>
                    {alert.value !== undefined && (
                      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: style.color }}>
                        {alert.value.toFixed(2)} / {alert.threshold?.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {!alert.acknowledged && (
                    <button
                      onClick={e => { e.stopPropagation(); acknowledge(alert.id); }}
                      style={{
                        padding: '3px 8px',
                        background: 'transparent',
                        border: `1px solid ${style.color}`,
                        borderRadius: 4,
                        color: style.color,
                        fontSize: 10, fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = style.bg; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      ACK
                    </button>
                  )}
                  <ChevronDown
                    size={14}
                    style={{
                      color: 'var(--text-muted)',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform var(--transition-fast)',
                      marginTop: 1
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
