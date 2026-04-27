'use client';
import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MOCK_COMMANDS } from '@/lib/mock-data';
import { generateTelemetryPoint } from '@/lib/mock-data';
import type { HardwareCommand } from '@/lib/types';
import {
  Cpu, CheckCircle, XCircle, Clock, Wifi, WifiOff,
  Send, RotateCcw, Sliders, Activity, AlertTriangle
} from 'lucide-react';

function CoilControl({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{
      padding: '16px',
      background: 'rgba(0,212,255,0.04)',
      border: '1px solid rgba(0,212,255,0.15)',
      borderRadius: 10
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
          {value.toFixed(1)} <span style={{ fontSize: 10, fontWeight: 400 }}>A</span>
        </span>
      </div>
      <input
        type="range" min={0} max={20} step={0.1}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="coil-slider"
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>0 A</span>
        <div className="progress-bar" style={{ width: 80, alignSelf: 'center' }}>
          <div className="progress-fill" style={{ width: `${(value / 20) * 100}%` }} />
        </div>
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>20 A</span>
      </div>
    </div>
  );
}

export default function HardwarePage() {
  const [coils, setCoils] = useState({ coilA: 8.4, coilB: 7.9, coilC: 8.1, coilD: 8.3 });
  const [freq, setFreq] = useState(50);
  const [phase, setPhase] = useState(0);
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'acked' | 'failed'>('idle');
  const [commands, setCommands] = useState<HardwareCommand[]>(MOCK_COMMANDS);
  const [hbLatency, setHbLatency] = useState(3.2);
  const [hwOnline] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      setHbLatency(prev => parseFloat((Math.max(1, prev + (Math.random() - 0.5) * 0.8)).toFixed(1)));
    }, 1500);
    return () => clearInterval(iv);
  }, []);

  function sendCommand() {
    setSendStatus('sending');
    const cmd: HardwareCommand = {
      id: `cmd-${Date.now()}`,
      experimentId: 'exp-001',
      commandType: 'SET_CURRENT',
      payload: { ...coils, frequency: freq, phase },
      status: 'PENDING',
      issuedAt: new Date().toISOString(),
      issuedBy: 'Dr. E. Vasquez',
    };
    setCommands(prev => [cmd, ...prev]);
    setTimeout(() => {
      setSendStatus('acked');
      setCommands(prev => prev.map(c => c.id === cmd.id ? { ...c, status: 'ACKNOWLEDGED', acknowledgedAt: new Date().toISOString() } : c));
      setTimeout(() => setSendStatus('idle'), 2000);
    }, 4 + Math.random() * 6); // <10ms simulated
  }

  const totalPower = (coils.coilA + coils.coilB + coils.coilC + coils.coilD) * 10.5;

  return (
    <DashboardLayout title="Hardware Control Panel" subtitle="Real-time actuator control — Rust serial/CAN bridge">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Hardware status bar */}
        <div className="glass-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {hwOnline ? <Wifi size={15} style={{ color: 'var(--accent-green)' }} /> : <WifiOff size={15} style={{ color: 'var(--accent-red)' }} />}
            <span style={{ fontSize: 12, fontWeight: 700, color: hwOnline ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {hwOnline ? 'BRIDGE ONLINE' : 'BRIDGE OFFLINE'}
            </span>
          </div>
          {[
            { label: 'Latency', value: `${hbLatency}ms`, color: hbLatency < 5 ? 'var(--accent-green)' : 'var(--accent-amber)' },
            { label: 'Protocol', value: 'CAN-FD 5Mbps', color: 'var(--text-secondary)' },
            { label: 'Est. Power', value: `${totalPower.toFixed(0)}W`, color: 'var(--accent-amber)' },
            { label: 'Commands/min', value: '12', color: 'var(--text-secondary)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', flex: 'none', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{label}:</span>
              <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
          {/* Coil controls */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sliders size={15} style={{ color: 'var(--accent-cyan)' }} /> Coil Current Control
            </h3>

            <div className="grid-2">
              <CoilControl label="Coil A" value={coils.coilA} onChange={v => setCoils(p => ({ ...p, coilA: v }))} />
              <CoilControl label="Coil B" value={coils.coilB} onChange={v => setCoils(p => ({ ...p, coilB: v }))} />
              <CoilControl label="Coil C" value={coils.coilC} onChange={v => setCoils(p => ({ ...p, coilC: v }))} />
              <CoilControl label="Coil D" value={coils.coilD} onChange={v => setCoils(p => ({ ...p, coilD: v }))} />
            </div>

            {/* Freq/phase */}
            <div className="grid-2">
              {[
                { label: 'Frequency (Hz)', value: freq, set: setFreq, min: 20, max: 100 },
                { label: 'Phase (°)', value: phase, set: setPhase, min: 0, max: 360 },
              ].map(({ label, value, set, min, max }) => (
                <div key={label} style={{ padding: '14px', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)' }}>{value}</span>
                  </div>
                  <input type="range" min={min} max={max} value={value} onChange={e => set(parseInt(e.target.value))}
                    className="coil-slider" style={{ accentColor: 'var(--accent-purple)' }} />
                </div>
              ))}
            </div>

            {/* Send button */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-primary"
                style={{ flex: 2, justifyContent: 'center', gap: 8 }}
                onClick={sendCommand}
                disabled={sendStatus === 'sending'}
                id="send-coil-command-btn"
              >
                {sendStatus === 'sending' ? (
                  <><Activity size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Dispatching...</>
                ) : sendStatus === 'acked' ? (
                  <><CheckCircle size={14} /> ACK Received</>
                ) : (
                  <><Send size={14} /> Dispatch Command</>
                )}
              </button>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setCoils({ coilA: 8.4, coilB: 7.9, coilC: 8.1, coilD: 8.3 })}>
                <RotateCcw size={14} /> Reset
              </button>
            </div>

            {sendStatus === 'acked' && (
              <div className="alert-banner alert-success">
                <CheckCircle size={13} />
                Command acknowledged in {(2 + Math.random() * 5).toFixed(1)}ms — within 5ms SLA ✓
              </div>
            )}
          </div>

          {/* Command log */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cpu size={15} style={{ color: 'var(--accent-purple)' }} /> Command Log
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 480 }}>
              {commands.map(cmd => (
                <div key={cmd.id} style={{
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {cmd.commandType}
                    </span>
                    <span style={{
                      fontSize: 9, padding: '1px 6px', borderRadius: 10,
                      background: cmd.status === 'ACKNOWLEDGED' ? 'rgba(16,185,129,0.15)' : cmd.status === 'FAILED' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                      color: cmd.status === 'ACKNOWLEDGED' ? 'var(--accent-green)' : cmd.status === 'FAILED' ? 'var(--accent-red)' : 'var(--accent-amber)',
                      border: `1px solid ${cmd.status === 'ACKNOWLEDGED' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                      fontWeight: 700,
                    }}>
                      {cmd.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {new Date(cmd.issuedAt).toLocaleTimeString()} • {cmd.issuedBy}
                  </div>
                  {cmd.acknowledgedAt && (
                    <div style={{ fontSize: 10, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                      ACK: +{(new Date(cmd.acknowledgedAt).getTime() - new Date(cmd.issuedAt).getTime()).toFixed(0)}ms
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
