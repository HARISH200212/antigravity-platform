'use client';
import { useState } from 'react';
import { Zap, CheckCircle, Loader2, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { MOCK_OPTIMIZATION } from '@/lib/mock-data';
import type { OptimizationResult } from '@/lib/types';

export function AIOptimizerCard() {
  const [result] = useState<OptimizationResult>(MOCK_OPTIMIZATION);
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('done');
  const [applied, setApplied] = useState(false);

  function runOptimizer() {
    setPhase('running');
    setApplied(false);
    setTimeout(() => setPhase('done'), 3000);
  }

  function applyConfig() {
    setApplied(true);
  }

  return (
    <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #8b5cf6, #00d4ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Zap size={18} color="#fff" />
        </div>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>AI Field Optimizer</h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>PPO Agent v3.2 • Stable-Baselines3</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span className="badge badge-completed">
            {(result.confidence * 100).toFixed(0)}% confidence
          </span>
        </div>
      </div>

      {/* Metrics row */}
      {phase === 'done' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{
            padding: '12px',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <TrendingDown size={13} style={{ color: 'var(--accent-green)' }} />
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Power Savings
              </span>
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
              -{result.estimatedPowerReduction}%
            </span>
          </div>
          <div style={{
            padding: '12px',
            background: 'var(--accent-cyan-dim)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <TrendingUp size={13} style={{ color: 'var(--accent-cyan)' }} />
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Stability Gain
              </span>
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              +{result.estimatedStabilityGain}%
            </span>
          </div>
        </div>
      )}

      {/* Suggested config */}
      {phase === 'done' && (
        <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Suggested Coil Configuration
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {Object.entries(result.suggestedConfig).filter(([k]) => k.startsWith('coil')).map(([key, val]) => (
              <div key={key} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{key}</span>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {(val as number).toFixed(1)} A
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Running state */}
      {phase === 'running' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px 0' }}>
          <Loader2 size={32} style={{ color: 'var(--accent-cyan)', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
            Running PPO optimization…
            <br />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Simulating 512 coil configurations</span>
          </p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {phase !== 'running' && (
          <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={runOptimizer}>
            <Zap size={14} /> Re-Optimize
          </button>
        )}
        {phase === 'done' && !applied && (
          <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={applyConfig}>
            <CheckCircle size={14} /> Apply Config
          </button>
        )}
        {applied && (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '10px',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 8,
          }}>
            <CheckCircle size={14} style={{ color: 'var(--accent-green)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-green)' }}>Config Applied</span>
          </div>
        )}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 10px',
        background: 'rgba(245,158,11,0.06)',
        border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: 6,
      }}>
        <AlertCircle size={12} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
        <span style={{ fontSize: 10, color: 'var(--accent-amber)', lineHeight: 1.4 }}>
          Operator approval required before hardware dispatch. Changes are logged to audit trail.
        </span>
      </div>
    </div>
  );
}
