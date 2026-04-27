'use client';
import dynamic from 'next/dynamic';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TelemetryStream } from '@/components/telemetry/TelemetryStream';
import { Activity, Loader2 } from 'lucide-react';

const FieldSimViewer = dynamic(
  () => import('@/components/simulation/FieldSimViewer').then(m => ({ default: m.FieldSimViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="glass-card" style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={32} style={{ color: 'var(--accent-cyan)', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading field simulator…</p>
        </div>
      </div>
    )
  }
);

export default function FieldSimPage() {
  return (
    <DashboardLayout title="Field Simulation Engine" subtitle="Analytical EM dipole superposition model — real-time 3D visualization">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div className="alert-banner alert-info">
          <Activity size={14} style={{ flexShrink: 0 }} />
          <span>
            <strong>Simulation mode active.</strong> Analytical dipole superposition model rendering 216 field vectors.
            Production environments use FEniCS FEM solver — converges in ≤30s for standard coil configs.
          </span>
        </div>

        {/* 3D viewer */}
        <FieldSimViewer />

        {/* Telemetry streams during simulation */}
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="live-dot" /> Live Field Measurements
        </h3>
        <div className="grid-4">
          <TelemetryStream metric="flux" label="Flux Density" unit="T" color="var(--accent-cyan)" warningThreshold={2.0} criticalThreshold={2.5} />
          <TelemetryStream metric="temperature" label="Coil Temperature" unit="°C" color="var(--accent-amber)" warningThreshold={75} criticalThreshold={85} />
          <TelemetryStream metric="displacement" label="Object Displacement" unit="mm" color="var(--accent-purple)" warningThreshold={20} criticalThreshold={25} />
          <TelemetryStream metric="powerW" label="Total Power" unit="W" color="var(--accent-green)" warningThreshold={450} criticalThreshold={600} />
        </div>
      </div>
    </DashboardLayout>
  );
}
