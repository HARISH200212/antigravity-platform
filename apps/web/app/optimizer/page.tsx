'use client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AIOptimizerCard } from '@/components/ai/AIOptimizerCard';
import { MOCK_EXPERIMENTS } from '@/lib/mock-data';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { Zap, TrendingDown, Brain, History, CheckCircle } from 'lucide-react';

// Training history mock data
const TRAINING_RUNS = Array.from({ length: 10 }, (_, i) => ({
  version: `v${i + 1}`,
  reward: 0.3 + i * 0.07 + (Math.random() - 0.5) * 0.05,
  powerSaving: 8 + i * 1.5 + (Math.random() - 0.5) * 1,
  stability: 75 + i * 2.2 + (Math.random() - 0.5) * 2,
  episodes: (i + 1) * 512,
}));

const REWARD_HISTORY = Array.from({ length: 200 }, (_, i) => ({
  step: i * 100,
  reward: Math.min(0.95, 0.1 + (i / 200) * 0.85 + Math.sin(i * 0.3) * 0.05 * (1 - i/200)),
  baseline: 0.3,
}));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(6,15,30,0.95)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Step {label?.toLocaleString()}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          {p.name}: {p.value?.toFixed(3)}
        </div>
      ))}
    </div>
  );
};

export default function OptimizerPage() {
  return (
    <DashboardLayout title="AI Field Optimizer" subtitle="PPO Reinforcement Learning Agent — Stable-Baselines3 v2.3">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Model info banner */}
        <div className="alert-banner alert-info">
          <Brain size={15} style={{ flexShrink: 0 }} />
          <div>
            <strong>Active Model: PPO Agent v3.2</strong> — Trained on 52,480 episodes across 8 synthetic field environments.
            Avg reward: 0.847. Last retrained: 2h ago. MLflow run ID: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>run_2026042701</code>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid-4">
          {[
            { label: 'Model Version', value: 'v3.2', color: 'var(--accent-cyan)', icon: Brain },
            { label: 'Avg Power Saving', value: '22.1%', color: 'var(--accent-green)', icon: TrendingDown },
            { label: 'Training Episodes', value: '52K', color: 'var(--accent-purple)', icon: History },
            { label: 'Convergence Rate', value: '94.7%', color: 'var(--accent-amber)', icon: CheckCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="glass-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Icon size={18} style={{ color }} />
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main panels */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>
          {/* Training reward chart */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, margin: '0 0 16px' }}>
              Training Reward Curve (PPO Episode History)
            </h3>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REWARD_HISTORY} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rewardGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.05)" />
                  <XAxis dataKey="step" tick={{ fontSize: 10, fill: '#475569' }} tickFormatter={v => `${v/1000}K`} />
                  <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: '#475569' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  <Area type="monotone" dataKey="reward" name="PPO Reward" stroke="var(--accent-cyan)" strokeWidth={2} fill="url(#rewardGrad)" dot={false} />
                  <Line type="monotone" dataKey="baseline" name="Baseline" stroke="rgba(245,158,11,0.6)" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Optimizer card */}
          <AIOptimizerCard />
        </div>

        {/* Training version history */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>
            Model Version History
          </h3>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TRAINING_RUNS} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.05)" />
                <XAxis dataKey="version" tick={{ fontSize: 10, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip contentStyle={{ background: 'rgba(6,15,30,0.95)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                <Line type="monotone" dataKey="powerSaving" name="Power Saving %" stroke="var(--accent-green)" strokeWidth={2} dot={{ fill: 'var(--accent-green)', r: 3 }} />
                <Line type="monotone" dataKey="stability" name="Stability Score" stroke="var(--accent-cyan)" strokeWidth={2} dot={{ fill: 'var(--accent-cyan)', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Architecture info */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>
            Agent Architecture
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Algorithm', value: 'PPO (Proximal Policy Optimization)', color: 'var(--accent-purple)' },
              { label: 'Observation Space', value: '[flux_density, temperature, displacement, coil_currents ×4]', color: 'var(--accent-cyan)' },
              { label: 'Action Space', value: 'Δ coil currents (continuous, bounded ±2A)', color: 'var(--accent-amber)' },
              { label: 'Reward Function', value: 'R = stability_score − 0.3 × power_norm', color: 'var(--accent-green)' },
              { label: 'Neural Network', value: '3-layer MLP, 256→256→64 units, tanh', color: 'var(--accent-cyan)' },
              { label: 'Training Framework', value: 'Stable-Baselines3 v2.3 + MLflow 2.11', color: 'var(--accent-purple)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8
              }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 12, color, fontWeight: 600, lineHeight: 1.4 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
