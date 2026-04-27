'use client';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SafetyWatchdog } from '@/components/safety/SafetyWatchdog';
import { AlertsPanel } from '@/components/safety/AlertsPanel';
import { MOCK_ALERTS, MOCK_AUDIT } from '@/lib/mock-data';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Download, FileText } from 'lucide-react';

function IncidentTimeline() {
  const critical = MOCK_ALERTS.filter(a => a.severity === 'CRITICAL');
  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <AlertTriangle size={15} style={{ color: 'var(--accent-red)' }} /> Critical Incident History
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {MOCK_ALERTS.map((alert, i) => {
          const colors = { CRITICAL: '#ef4444', WARNING: '#f59e0b', INFO: '#00d4ff' };
          const color = colors[alert.severity];
          return (
            <div key={alert.id} style={{ display: 'flex', gap: 12, paddingBottom: 16, position: 'relative' }}>
              {/* Timeline line */}
              {i < MOCK_ALERTS.length - 1 && (
                <div style={{
                  position: 'absolute', left: 10, top: 20, bottom: 0,
                  width: 1, background: 'var(--border-subtle)'
                }} />
              )}
              {/* Dot */}
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: `${color}22`, border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 2
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{alert.title}</span>
                  <span style={{
                    fontSize: 9, padding: '1px 6px', borderRadius: 10,
                    background: `${color}20`, border: `1px solid ${color}40`,
                    color, fontWeight: 700, textTransform: 'uppercase'
                  }}>{alert.severity}</span>
                  {alert.acknowledged && (
                    <CheckCircle size={11} style={{ color: 'var(--accent-green)' }} />
                  )}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 4px', lineHeight: 1.5 }}>{alert.message}</p>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={9} /> {new Date(alert.triggeredAt).toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SafetyPage() {
  const stats = [
    { label: 'Critical Incidents (30d)', value: 1, color: 'var(--accent-red)', icon: XCircle },
    { label: 'Warnings Issued (30d)', value: 8, color: 'var(--accent-amber)', icon: AlertTriangle },
    { label: 'Auto E-Stops', value: 1, color: 'var(--accent-red)', icon: Shield },
    { label: 'Avg Response Time', value: '<10ms', color: 'var(--accent-green)', icon: Clock },
    { label: 'Compliance Score', value: '99.7%', color: 'var(--accent-cyan)', icon: CheckCircle },
    { label: 'Last Audit', value: 'Today', color: 'var(--accent-purple)', icon: FileText },
  ];

  return (
    <DashboardLayout title="Safety Watchdog" subtitle="IEEE 1584 / IEC 61010 Compliance Center">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Stats */}
        <div className="grid-3">
          {stats.map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                background: `${color}18`, border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance banner */}
        <div className="alert-banner alert-success">
          <CheckCircle size={16} style={{ flexShrink: 0 }} />
          <div>
            <strong>All systems compliant.</strong> Hardware interlock active. Redundant watchdog processes running on both cloud and edge nodes.
            Last IEEE 1584 compliance check: {new Date().toLocaleDateString()} — <strong>PASSED</strong>
          </div>
          <button className="btn-secondary" style={{ flexShrink: 0, padding: '5px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={12} /> Compliance Report
          </button>
        </div>

        {/* Main panels */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <SafetyWatchdog />
          <AlertsPanel maxItems={8} />
        </div>

        {/* Incident timeline */}
        <IncidentTimeline />
      </div>
    </DashboardLayout>
  );
}
