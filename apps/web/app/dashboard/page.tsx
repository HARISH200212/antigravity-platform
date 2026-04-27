'use client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TelemetryStream } from '@/components/telemetry/TelemetryStream';
import { AlertsPanel } from '@/components/safety/AlertsPanel';
import { AIOptimizerCard } from '@/components/ai/AIOptimizerCard';
import { SafetyWatchdog } from '@/components/safety/SafetyWatchdog';
import { MOCK_METRICS, MOCK_EXPERIMENTS } from '@/lib/mock-data';
import {
  Activity, Cpu, Shield, Zap, TrendingDown,
  FlaskConical, Radio, Database, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, unit, icon: Icon, color, trend, trendLabel
}: {
  label: string; value: string | number; unit?: string; icon: any;
  color: string; trend?: 'up' | 'down' | 'neutral'; trendLabel?: string;
}) {
  return (
    <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `linear-gradient(135deg, ${color}33, ${color}11)`,
          border: `1px solid ${color}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} style={{ color }} />
        </div>
        {trend && (
          <span className={trend === 'down' ? 'metric-delta-pos' : trend === 'up' ? 'metric-delta-neg' : ''} style={{ fontSize: 11 }}>
            {trendLabel}
          </span>
        )}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span className="metric-value" style={{ color }}>{value}</span>
          {unit && <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{unit}</span>}
        </div>
        <div className="metric-label" style={{ marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

// ─── EXPERIMENT ROW ───────────────────────────────────────────────────────────
function ExperimentRow({ exp }: { exp: typeof MOCK_EXPERIMENTS[0] }) {
  const statusClass = {
    RUNNING: 'badge-running', PAUSED: 'badge-paused', COMPLETED: 'badge-completed',
    DRAFT: 'badge-draft', ARCHIVED: 'badge-draft', CONFIGURED: 'badge-completed',
  }[exp.status];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 120px 90px 80px 80px 80px 36px',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      borderBottom: '1px solid rgba(0,212,255,0.04)',
      transition: 'background var(--transition-fast)',
      cursor: 'pointer',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{exp.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{exp.researcher} • {exp.labGroup}</div>
      </div>
      <span className={`badge ${statusClass}`}>{exp.status}</span>
      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
        {exp.powerConsumption > 0 ? `${exp.powerConsumption}W` : '—'}
      </span>
      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: exp.stabilityScore > 85 ? 'var(--accent-green)' : exp.stabilityScore > 60 ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
        {exp.stabilityScore > 0 ? `${exp.stabilityScore}%` : '—'}
      </span>
      <span style={{ fontSize: 11 }}>
        {exp.aiOptimized ? (
          <span style={{ color: 'var(--accent-purple)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap size={11} /> AI
          </span>
        ) : '—'}
      </span>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        {exp.startedAt ? new Date(exp.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
      </span>
      <Link href={`/experiments/${exp.id}`}>
        <ArrowUpRight size={16} style={{ color: 'var(--text-muted)', transition: 'color var(--transition-fast)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-cyan)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        />
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const m = MOCK_METRICS;

  return (
    <DashboardLayout title="Mission Control" subtitle="Real-time overview of all lab systems and active experiments">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ─── STAT CARDS ─────────────────────────────────── */}
        <div className="grid-4" style={{ animationDelay: '0ms' }}>
          <StatCard label="Active Experiments" value={m.activeExperiments} icon={FlaskConical} color="var(--accent-cyan)" trend="neutral" />
          <StatCard label="Sensor Events Today" value={(m.totalSensorEvents / 1e6).toFixed(2)} unit="M" icon={Radio} color="var(--accent-purple)" trend="up" trendLabel="+18%" />
          <StatCard label="AI Power Savings" value={m.aiOptimizationSavings} unit="%" icon={TrendingDown} color="var(--accent-green)" trend="down" trendLabel="-22.1%" />
          <StatCard label="Safety Alerts Today" value={m.safetyAlertsToday} icon={Shield} color={m.safetyAlertsToday > 2 ? 'var(--accent-amber)' : 'var(--accent-green)'} trend="neutral" />
        </div>

        {/* ─── SECONDARY STATS ─────────────────────────────── */}
        <div className="grid-4">
          <StatCard label="Avg Power Draw" value={m.avgPowerConsumption} unit="W" icon={Zap} color="var(--accent-amber)" />
          <StatCard label="Kafka Lag" value={m.kafkaLag} unit="msg" icon={Database} color={m.kafkaLag > 1000 ? 'var(--accent-red)' : 'var(--accent-green)'} trend="neutral" />
          <StatCard label="Platform Uptime" value={m.uptime} unit="%" icon={Activity} color="var(--accent-green)" trend="neutral" />
          <StatCard label="Hardware Bridge" value={m.hardwareOnline ? 'ONLINE' : 'OFFLINE'} icon={Cpu} color={m.hardwareOnline ? 'var(--accent-green)' : 'var(--accent-red)'} trend="neutral" />
        </div>

        {/* ─── TELEMETRY STREAMS ──────────────────────────── */}
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="live-dot" />
            Live Telemetry — exp-001 (Alpha-7)
          </h2>
          <div className="grid-4">
            <TelemetryStream metric="flux" label="Flux Density" unit="T" color="var(--accent-cyan)" warningThreshold={2.0} criticalThreshold={2.5} />
            <TelemetryStream metric="temperature" label="Temperature" unit="°C" color="var(--accent-amber)" warningThreshold={75} criticalThreshold={85} />
            <TelemetryStream metric="displacement" label="Displacement" unit="mm" color="var(--accent-purple)" warningThreshold={20} criticalThreshold={25} />
            <TelemetryStream metric="powerW" label="Power Draw" unit="W" color="var(--accent-green)" warningThreshold={400} criticalThreshold={550} />
          </div>
        </div>

        {/* ─── MAIN PANELS ─────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 340px', gap: 16 }}>
          {/* Experiments Table */}
          <div className="glass-card" style={{ gridColumn: '1 / 3' }}>
            <div style={{
              padding: '16px 20px 12px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Recent Experiments
              </h3>
              <Link href="/experiments" className="btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }}>
                View All →
              </Link>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 120px 90px 80px 80px 80px 36px',
              gap: 12, padding: '8px 16px',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              {['Experiment', 'Status', 'Power', 'Stability', 'AI', 'Started', ''].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
              ))}
            </div>
            {MOCK_EXPERIMENTS.slice(0, 4).map(exp => (
              <ExperimentRow key={exp.id} exp={exp} />
            ))}
          </div>

          {/* Alerts */}
          <AlertsPanel maxItems={4} />
        </div>

        {/* ─── SAFETY + AI ─────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <SafetyWatchdog />
          <AIOptimizerCard />
        </div>
      </div>
    </DashboardLayout>
  );
}
