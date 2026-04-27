'use client';
import { use } from 'react';
import dynamic from 'next/dynamic';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ArrowLeft, Activity, Info } from 'lucide-react';
import Link from 'next/link';

// Three.js component needs dynamic import (no SSR)
const FieldSimViewer = dynamic(
  () => import('@/components/simulation/FieldSimViewer').then(m => ({ default: m.FieldSimViewer })),
  { ssr: false, loading: () => (
    <div className="glass-card" style={{ height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--accent-cyan)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading 3D field renderer...</p>
      </div>
    </div>
  )}
);

export default function ExperimentReplayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <DashboardLayout
      title="3D Simulation Replay"
      subtitle="Electromagnetic field vector visualization — WebGL renderer"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Back */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href={`/experiments/${id}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-cyan)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            <ArrowLeft size={14} /> Back to Experiment
          </Link>
          <div style={{ flex: 1 }} />
          <div className="badge badge-completed">
            <Activity size={10} /> REPLAY ACTIVE
          </div>
        </div>

        {/* Info banner */}
        <div className="alert-banner alert-info">
          <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            <strong>3D EM Field Visualization</strong> — Rendered from analytical dipole superposition model.
            Colour mapping: blue = low flux (≤0.1T), red = high flux (≥2.0T). Drag to rotate, scroll to zoom.
          </span>
        </div>

        {/* 3D Viewer */}
        <FieldSimViewer />

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Avg Flux Density', value: '1.82', unit: 'T', color: 'var(--accent-cyan)' },
            { label: 'Peak Flux', value: '2.31', unit: 'T', color: 'var(--accent-amber)' },
            { label: 'Field Vectors', value: '216', unit: 'pts', color: 'var(--accent-purple)' },
            { label: 'Simulation Time', value: '28.4', unit: 's', color: 'var(--accent-green)' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>
                {value} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>{unit}</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', marginTop: 4 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Annotation panel */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Annotations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { time: '00:02:14', note: 'Field stabilization observed. Payload levitation confirmed at 14.8mm altitude.', author: 'Dr. E. Vasquez' },
              { time: '00:07:41', note: 'AI optimizer suggested config applied. Power draw dropped from 412W → 342W (-17%).', author: 'System' },
              { time: '00:23:08', note: 'Minor flux density spike on Coil A (2.28T). Within safe threshold. Monitoring.', author: 'Safety WD' },
            ].map(({ time, note, author }) => (
              <div key={time} style={{
                display: 'flex', gap: 12,
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-cyan)', flexShrink: 0, fontWeight: 600 }}>{time}</span>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 3px' }}>{note}</p>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>— {author}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <input className="agt-input" placeholder="Add annotation at current timestamp..." style={{ flex: 1 }} />
            <button className="btn-primary">Add Note</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
