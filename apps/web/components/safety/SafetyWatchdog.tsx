'use client';
import { useState, useEffect, useRef } from 'react';
import { Shield, AlertTriangle, XCircle, CheckCircle, Zap } from 'lucide-react';
import { generateTelemetryPoint } from '@/lib/mock-data';

interface ThresholdGaugeProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  warning: number;
  critical: number;
}

function ThresholdGauge({ label, value, max, unit, warning, critical }: ThresholdGaugeProps) {
  const pct = Math.min((value / max) * 100, 100);
  const isWarning = value >= warning;
  const isCritical = value >= critical;
  const color = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color }}>
          {value.toFixed(2)} <span style={{ fontSize: 10, fontWeight: 400 }}>{unit}</span>
        </span>
      </div>
      <div style={{ position: 'relative', height: 6, background: 'var(--border-subtle)', borderRadius: 3 }}>
        {/* Warning marker */}
        <div style={{
          position: 'absolute', top: -3, bottom: -3,
          left: `${(warning / max) * 100}%`, width: 1,
          background: '#f59e0b', opacity: 0.7
        }} />
        {/* Critical marker */}
        <div style={{
          position: 'absolute', top: -3, bottom: -3,
          left: `${(critical / max) * 100}%`, width: 1,
          background: '#ef4444', opacity: 0.7
        }} />
        {/* Fill */}
        <div style={{
          position: 'absolute', top: 0, left: 0,
          height: '100%', width: `${pct}%`,
          background: `linear-gradient(90deg, #10b981 0%, ${color} 100%)`,
          borderRadius: 3,
          transition: 'width 0.4s ease, background 0.3s ease',
          boxShadow: `0 0 8px ${color}`,
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>0</span>
        <span style={{ fontSize: 9, color: '#f59e0b' }}>⚠ {warning}{unit}</span>
        <span style={{ fontSize: 9, color: '#ef4444' }}>✕ {critical}{unit}</span>
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{max}</span>
      </div>
    </div>
  );
}

export function SafetyWatchdog() {
  const [telemetry, setTelemetry] = useState(() => generateTelemetryPoint(Date.now()));
  const [emergencyStopped, setEmergencyStopped] = useState(false);
  const [stopTime, setStopTime] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!emergencyStopped) {
      intervalRef.current = setInterval(() => {
        setTelemetry(generateTelemetryPoint(Date.now()));
      }, 800);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [emergencyStopped]);

  function handleEmergencyStop() {
    const t0 = performance.now();
    setEmergencyStopped(true);
    const t1 = performance.now();
    setStopTime(t1 - t0);
  }

  const isAllSafe = !emergencyStopped &&
    telemetry.flux < 2.3 &&
    telemetry.temperature < 82 &&
    telemetry.displacement < 22;

  return (
    <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: emergencyStopped
            ? 'linear-gradient(135deg, #dc2626, #7f1d1d)'
            : isAllSafe
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #f59e0b, #d97706)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.5s ease',
          ...(emergencyStopped ? {} : { animation: 'pulseGlow 2s ease-in-out infinite' }),
        }}>
          <Shield size={18} color="#fff" />
        </div>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Safety Watchdog</h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>IEEE 1584 Compliant • IEC 61010</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          {emergencyStopped ? (
            <span className="badge badge-stopped">E-STOP ACTIVE</span>
          ) : isAllSafe ? (
            <span className="badge badge-running">NOMINAL</span>
          ) : (
            <span className="badge badge-paused">WARNING</span>
          )}
        </div>
      </div>

      {/* Threshold Gauges */}
      {!emergencyStopped && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ThresholdGauge
            label="Flux Density"
            value={telemetry.flux}
            max={4}
            unit="T"
            warning={2.0}
            critical={2.5}
          />
          <ThresholdGauge
            label="Temperature"
            value={telemetry.temperature}
            max={100}
            unit="°C"
            warning={75}
            critical={85}
          />
          <ThresholdGauge
            label="Displacement"
            value={telemetry.displacement}
            max={40}
            unit="mm"
            warning={20}
            critical={25}
          />
          <ThresholdGauge
            label="Power Draw"
            value={telemetry.powerW}
            max={700}
            unit="W"
            warning={500}
            critical={600}
          />
        </div>
      )}

      {/* Emergency stopped state */}
      {emergencyStopped && (
        <div style={{
          padding: '16px',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 8,
          textAlign: 'center',
        }}>
          <XCircle size={32} style={{ color: '#ef4444', margin: '0 auto 8px' }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>
            Emergency Stop Engaged
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
            All coil currents set to zero. Hardware watchdog active.
          </div>
          {stopTime !== null && (
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 13,
              color: 'var(--accent-green)', fontWeight: 700
            }}>
              Response time: {stopTime.toFixed(1)}ms ✓
            </div>
          )}
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            Audit entry written • Experiment paused • Safety team notified
          </div>
        </div>
      )}

      {/* Emergency Stop Button */}
      <button
        className="emergency-stop"
        onClick={handleEmergencyStop}
        disabled={emergencyStopped}
        style={{
          opacity: emergencyStopped ? 0.5 : 1,
          cursor: emergencyStopped ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}
        aria-label="Emergency stop button"
      >
        <Zap size={18} />
        EMERGENCY STOP
        <Zap size={18} />
      </button>

      {/* Watchdog status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: 'Cloud WD', status: !emergencyStopped },
          { label: 'Edge WD', status: true },
          { label: 'HW Interlock', status: true },
        ].map(({ label, status }) => (
          <div key={label} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '8px 4px',
            background: status ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
            border: `1px solid ${status ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            borderRadius: 6,
          }}>
            {status
              ? <CheckCircle size={13} style={{ color: 'var(--accent-green)' }} />
              : <XCircle size={13} style={{ color: 'var(--accent-red)' }} />
            }
            <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
