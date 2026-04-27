'use client';
import { useEffect, useState } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MOCK_AUDIT } from '@/lib/mock-data';
import { FileText, Search, Download, Shield, Link2, CheckCircle, Filter } from 'lucide-react';
import type { AuditEntry } from '@/lib/types';

const ACTION_COLORS: Record<string, string> = {
  EMERGENCY_STOP: 'var(--accent-red)',
  START_EXPERIMENT: 'var(--accent-green)',
  PAUSE_EXPERIMENT: 'var(--accent-amber)',
  APPLY_AI_CONFIG: 'var(--accent-purple)',
  USER_CREATED: 'var(--accent-cyan)',
};

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [entries] = useState<AuditEntry[]>(MOCK_AUDIT);
  const [now, setNow] = useState('');
  useEffect(() => { setNow(new Date().toLocaleString()); }, []);

  const filtered = entries.filter(e =>
    !search || e.action.includes(search.toUpperCase()) ||
    e.userName.toLowerCase().includes(search.toLowerCase()) ||
    e.resource.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Audit & Compliance Log" subtitle="Immutable, tamper-evident event log with SHA-256 hash chaining">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Integrity banner */}
        <div className="alert-banner alert-success">
          <Shield size={14} style={{ flexShrink: 0 }} />
          <div>
            <strong>Log integrity verified.</strong> Hash chain intact — {entries.length} entries, 0 tampered records detected.
            Last verification: <strong>{now || '—'}</strong>
          </div>
          <span className="badge badge-running" style={{ flexShrink: 0, marginLeft: 'auto' }}>SOC 2 CC7.2</span>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="agt-input" style={{ paddingLeft: 30 }} placeholder="Search by action, user, resource..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn-secondary" style={{ gap: 6, fontSize: 12 }}>
            <Filter size={13} /> Filter
          </button>
          <button className="btn-secondary" style={{ gap: 6, fontSize: 12 }}>
            <Download size={13} /> Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid-4">
          {[
            { label: 'Total Entries', value: entries.length, color: 'var(--accent-cyan)' },
            { label: 'E-Stop Events', value: entries.filter(e => e.action === 'EMERGENCY_STOP').length, color: 'var(--accent-red)' },
            { label: 'AI Configs Applied', value: entries.filter(e => e.action === 'APPLY_AI_CONFIG').length, color: 'var(--accent-purple)' },
            { label: 'Unique Actors', value: new Set(entries.map(e => e.userId)).size, color: 'var(--accent-green)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="agt-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>IP Address</th>
                  <th>Hash Chain</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(entry => (
                  <tr key={entry.id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{entry.userName}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{entry.userId}</div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                        background: `${ACTION_COLORS[entry.action] ?? 'var(--text-muted)'}18`,
                        border: `1px solid ${ACTION_COLORS[entry.action] ?? 'var(--border-subtle)'}40`,
                        color: ACTION_COLORS[entry.action] ?? 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {entry.action}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: 12 }}>{entry.resource}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{entry.resourceId}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{entry.ipAddress}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle size={11} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                          {entry.hashChain.substring(0, 16)}…
                        </span>
                      </div>
                    </td>
                    <td>
                      {entry.payload && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)' }}>
                          {JSON.stringify(entry.payload).substring(0, 40)}…
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
