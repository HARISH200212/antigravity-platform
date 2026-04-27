'use client';
import { use } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TelemetryStream } from '@/components/telemetry/TelemetryStream';
import { MOCK_EXPERIMENTS } from '@/lib/mock-data';
import { Play, Pause, Archive, Cpu, Shield, Zap, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ExperimentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const exp = MOCK_EXPERIMENTS.find(e => e.id === id) ?? MOCK_EXPERIMENTS[0];

  const statusClass = {
    RUNNING: 'badge-running', PAUSED: 'badge-paused', COMPLETED: 'badge-completed',
    DRAFT: 'badge-draft', ARCHIVED: 'badge-draft', CONFIGURED: 'badge-completed'
  }[exp.status];

  return (
    <DashboardLayout title={exp.name} subtitle={`${exp.labGroup} • ${exp.researcher}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Back + actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/experiments" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-cyan)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            <ArrowLeft size={14} /> All Experiments
          </Link>
          <div style={{ flex: 1 }} />
          <span className={`badge ${statusClass}`}>{exp.status}</span>
          {exp.status === 'RUNNING' && (
            <button className="btn-secondary" style={{ gap: 6 }}><Pause size={13} /> Pause</button>
          )}
          {exp.status === 'PAUSED' && (
            <button className="btn-primary" style={{ gap: 6 }}><Play size={13} /> Resume</button>
          )}
          <Link href={`/experiments/${id}/replay`} className="btn-secondary" style={{ gap: 6, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            <ExternalLink size={13} /> 3D Replay
          </Link>
        </div>

        {/* Exp description */}
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{exp.description}</p>
          <div style={{ display: 'flex', gap: 20, marginTop: 14, flexWrap: 'wrap' }}>
            {[
              { label: 'Started', value: exp.startedAt ? new Date(exp.startedAt).toLocaleString() : '—' },
              { label: 'Power', value: exp.powerConsumption > 0 ? `${exp.powerConsumption} W` : '—' },
              { label: 'Stability', value: exp.stabilityScore > 0 ? `${exp.stabilityScore}%` : '—' },
              { label: 'AI Optimized', value: exp.aiOptimized ? 'Yes' : 'No' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Coil Configuration */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Cpu size={16} style={{ color: 'var(--accent-cyan)' }} /> Coil Configuration
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            {Object.entries(exp.coilConfig).map(([key, val]) => (
              <div key={key} style={{
                padding: '12px',
                background: 'rgba(0,212,255,0.04)',
                border: '1px solid rgba(0,212,255,0.15)',
                borderRadius: 8
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  {key}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {typeof val === 'number' ? val.toFixed(1) : val}
                  <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>
                    {key.startsWith('coil') ? 'A' : key === 'frequency' ? 'Hz' : '°'}
                  </span>
                </div>

                {/* Slider */}
                {key.startsWith('coil') && (
                  <input
                    type="range" min={0} max={20} step={0.1}
                    defaultValue={val as number}
                    className="coil-slider"
                    style={{ marginTop: 8 }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Safety thresholds */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} style={{ color: 'var(--accent-amber)' }} /> Safety Thresholds
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            {Object.entries(exp.safetyThresholds).map(([key, val]) => (
              <div key={key} style={{
                padding: '10px 14px',
                background: 'rgba(245,158,11,0.04)',
                border: '1px solid rgba(245,158,11,0.15)',
                borderRadius: 8
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                  {typeof val === 'number' ? val.toFixed(1) : val}
                  <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>
                    {key.includes('Flux') ? 'T' : key.includes('Temp') ? '°C' : key.includes('Disp') ? 'mm' : 'V'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live telemetry */}
        {exp.status === 'RUNNING' && (
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="live-dot" /> Live Sensor Telemetry
            </h3>
            <div className="grid-4">
              <TelemetryStream metric="flux" label="Flux Density" unit="T" color="var(--accent-cyan)" warningThreshold={exp.safetyThresholds.maxFluxDensity * 0.85} criticalThreshold={exp.safetyThresholds.maxFluxDensity} />
              <TelemetryStream metric="temperature" label="Temperature" unit="°C" color="var(--accent-amber)" warningThreshold={exp.safetyThresholds.maxTemperature * 0.88} criticalThreshold={exp.safetyThresholds.maxTemperature} />
              <TelemetryStream metric="displacement" label="Displacement" unit="mm" color="var(--accent-purple)" warningThreshold={exp.safetyThresholds.maxDisplacement * 0.8} criticalThreshold={exp.safetyThresholds.maxDisplacement} />
              <TelemetryStream metric="powerW" label="Power Draw" unit="W" color="var(--accent-green)" warningThreshold={500} criticalThreshold={600} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
