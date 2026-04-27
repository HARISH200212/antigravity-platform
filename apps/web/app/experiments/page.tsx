'use client';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MOCK_EXPERIMENTS } from '@/lib/mock-data';
import type { Experiment, ExperimentStatus } from '@/lib/types';
import {
  Plus, Search, FlaskConical, Zap, Calendar,
  ChevronRight, Play, Pause, Archive, Trash2,
  CheckCircle, Clock, Settings2, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

const STATUS_FILTERS: (ExperimentStatus | 'ALL')[] = ['ALL', 'RUNNING', 'PAUSED', 'COMPLETED', 'DRAFT', 'ARCHIVED'];

const STATUS_ICONS: Record<ExperimentStatus, any> = {
  RUNNING: Play, PAUSED: Pause, COMPLETED: CheckCircle,
  DRAFT: Settings2, ARCHIVED: Archive, CONFIGURED: CheckCircle
};

function ExperimentCard({ exp }: { exp: Experiment }) {
  const Icon = STATUS_ICONS[exp.status];
  const statusClass = {
    RUNNING: 'badge-running', PAUSED: 'badge-paused', COMPLETED: 'badge-completed',
    DRAFT: 'badge-draft', ARCHIVED: 'badge-draft', CONFIGURED: 'badge-completed'
  }[exp.status];

  const runTime = exp.startedAt
    ? Math.floor((Date.now() - new Date(exp.startedAt).getTime()) / 60000)
    : null;

  return (
    <Link href={`/experiments/${exp.id}`}>
      <div className="glass-card" style={{
        padding: '18px',
        display: 'flex', flexDirection: 'column', gap: 14,
        cursor: 'pointer',
        transition: 'all var(--transition-smooth)',
        textDecoration: 'none',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9, flexShrink: 0,
            background: exp.status === 'RUNNING'
              ? 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(0,212,255,0.2))'
              : 'rgba(255,255,255,0.04)',
            border: `1px solid ${exp.status === 'RUNNING' ? 'rgba(16,185,129,0.4)' : 'var(--border-subtle)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={17} style={{ color: exp.status === 'RUNNING' ? 'var(--accent-green)' : 'var(--text-muted)' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {exp.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{exp.researcher}</div>
          </div>
          <span className={`badge ${statusClass}`}>{exp.status}</span>
        </div>

        {/* Description */}
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {exp.description}
        </p>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Power', value: exp.powerConsumption > 0 ? `${exp.powerConsumption}W` : '—', color: 'var(--accent-amber)' },
            { label: 'Stability', value: exp.stabilityScore > 0 ? `${exp.stabilityScore}%` : '—', color: exp.stabilityScore > 85 ? 'var(--accent-green)' : 'var(--text-secondary)' },
            { label: exp.startedAt ? 'Runtime' : 'Created', value: runTime !== null ? `${runTime}m` : new Date(exp.createdAt).toLocaleDateString(), color: 'var(--text-secondary)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              padding: '8px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 6,
              border: '1px solid var(--border-subtle)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 4,
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)', fontFamily: 'var(--font-mono)'
            }}>
              {exp.labGroup}
            </span>
            {exp.aiOptimized && (
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 4,
                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
                color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: 3
              }}>
                <Zap size={9} /> AI
              </span>
            )}
          </div>
          <ArrowUpRight size={15} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>
    </Link>
  );
}

export default function ExperimentsPage() {
  const [filter, setFilter] = useState<ExperimentStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = MOCK_EXPERIMENTS
    .filter(e => filter === 'ALL' || e.status === filter)
    .filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.researcher.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout title="Experiment Manager" subtitle={`${MOCK_EXPERIMENTS.length} experiments across all labs`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="agt-input"
              style={{ paddingLeft: 32 }}
              placeholder="Search experiments or researchers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Status filters */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 11, fontWeight: 700,
                  border: `1px solid ${filter === s ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                  background: filter === s ? 'var(--accent-cyan-dim)' : 'transparent',
                  color: filter === s ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  letterSpacing: '0.04em',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* New Experiment */}
          <button
            className="btn-primary"
            onClick={() => setShowCreate(true)}
            id="create-experiment-btn"
          >
            <Plus size={15} /> New Experiment
          </button>
        </div>

        {/* State machine visualization */}
        <div className="glass-card" style={{ padding: '12px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto' }}>
            {(['DRAFT', 'CONFIGURED', 'RUNNING', 'PAUSED', 'COMPLETED', 'ARCHIVED'] as ExperimentStatus[]).map((s, i, arr) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{
                  padding: '4px 12px', borderRadius: 20,
                  background: filter === s ? 'var(--accent-cyan-dim)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${filter === s ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                  fontSize: 11, fontWeight: 600,
                  color: filter === s ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  display: 'flex', alignItems: 'center', gap: 4
                }} onClick={() => setFilter(s)}>
                  {MOCK_EXPERIMENTS.filter(e => e.status === s).length > 0 && (
                    <span style={{
                      width: 16, height: 16, borderRadius: '50%',
                      background: 'var(--accent-cyan)',
                      color: '#000', fontSize: 9, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {MOCK_EXPERIMENTS.filter(e => e.status === s).length}
                    </span>
                  )}
                  {s}
                </div>
                {i < arr.length - 1 && <ChevronRight size={14} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Experiment cards grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <FlaskConical size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 14 }}>No experiments found.</p>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map(exp => (
              <ExperimentCard key={exp.id} exp={exp} />
            ))}
          </div>
        )}

        {/* Create experiment modal */}
        {showCreate && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(2,11,24,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} onClick={() => setShowCreate(false)}>
            <div className="glass-card" style={{
              width: '100%', maxWidth: 520, padding: '28px', margin: '20px',
              animation: 'fadeInUp 0.3s ease forwards',
            }} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>
                New Experiment
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    EXPERIMENT NAME
                  </label>
                  <input className="agt-input" placeholder="e.g. Levitation Stability Beta-1" />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    DESCRIPTION
                  </label>
                  <textarea className="agt-input" rows={3} placeholder="Describe experiment objectives and methodology..." />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>LAB GROUP</label>
                    <select className="agt-input" style={{ cursor: 'pointer' }}>
                      <option>Propulsion Lab A</option>
                      <option>Propulsion Lab B</option>
                      <option>Safety Systems</option>
                      <option>AI Research</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>MAX FLUX (T)</label>
                    <input className="agt-input" type="number" defaultValue={2.5} step={0.1} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowCreate(false)}>
                    Cancel
                  </button>
                  <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowCreate(false)}>
                    <Plus size={14} /> Create Experiment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
