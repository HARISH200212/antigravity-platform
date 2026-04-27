'use client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MOCK_AUDIT } from '@/lib/mock-data';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { generateTelemetryHistory } from '@/lib/mock-data';
import { BarChart3, Activity, Zap, TrendingDown, Download, Calendar } from 'lucide-react';

const COLORS = ['#00d4ff', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

// Power per experiment data
const POWER_DATA = [
  { name: 'Alpha-7', power: 342, optimized: 267 },
  { name: 'Grid B', power: 487, optimized: 487 },
  { name: 'Thermal', power: 612, optimized: 612 },
  { name: 'PPO v3', power: 0, optimized: 0 },
  { name: 'Freq Sweep', power: 280, optimized: 218 },
];

const PIE_DATA = [
  { name: 'Hall-Effect', value: 38 },
  { name: 'Flux Density', value: 29 },
  { name: 'Thermal', value: 18 },
  { name: 'Accelerometer', value: 15 },
];

const history = generateTelemetryHistory(60);
const TELEMETRY_TREND = history.map((d, i) => ({
  time: i,
  flux: d.flux,
  temperature: d.temperature,
  power: d.powerW,
}));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(6,15,30,0.95)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color, fontFamily: 'var(--font-mono)', fontWeight: 600, marginBottom: 2 }}>
          {p.name}: {p.value?.toFixed(2)}
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  return (
    <DashboardLayout title="Research Analytics" subtitle="BI dashboard — sensor telemetry, power analysis, and experiment insights">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['24h', '7d', '30d', '90d', 'All'].map(r => (
              <button key={r} style={{
                padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                border: `1px solid ${r === '24h' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                background: r === '24h' ? 'var(--accent-cyan-dim)' : 'transparent',
                color: r === '24h' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all var(--transition-fast)',
              }}>{r}</button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <button className="btn-secondary" style={{ fontSize: 12, gap: 6 }}>
            <Download size={13} /> Export HDF5
          </button>
          <button className="btn-secondary" style={{ fontSize: 12, gap: 6 }}>
            <Calendar size={13} /> Schedule Report
          </button>
        </div>

        {/* KPI row */}
        <div className="grid-4">
          {[
            { label: 'Total Sensor Events', value: '2.85M', sub: '+14% vs yesterday', color: 'var(--accent-cyan)', icon: Activity },
            { label: 'Avg Power Draw', value: '430W', sub: 'Across all experiments', color: 'var(--accent-amber)', icon: Zap },
            { label: 'AI Power Savings', value: '22.1%', sub: 'vs baseline this week', color: 'var(--accent-green)', icon: TrendingDown },
            { label: 'Data Points Exported', value: '847K', sub: 'To HDF5 / CSV', color: 'var(--accent-purple)', icon: BarChart3 },
          ].map(({ label, value, sub, color, icon: Icon }) => (
            <div key={label} className="glass-card" style={{ padding: '18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: `${color}18`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={17} style={{ color }} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          {/* Telemetry trend */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>
              Sensor Telemetry Trend (60min)
            </h3>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TELEMETRY_TREND} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    {[['flux', 'var(--accent-cyan)'], ['temperature', 'var(--accent-amber)']].map(([key, color]) => (
                      <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.05)" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#475569' }} tickFormatter={v => `${v}m`} />
                  <YAxis tick={{ fontSize: 9, fill: '#475569' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="flux" name="Flux (T)" stroke="var(--accent-cyan)" strokeWidth={2} fill="url(#grad-flux)" dot={false} />
                  <Area type="monotone" dataKey="temperature" name="Temp (°C)" stroke="var(--accent-amber)" strokeWidth={2} fill="url(#grad-temperature)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sensor distribution pie */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>
              Sensor Type Distribution
            </h3>
            <div style={{ height: 160, marginBottom: 12 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {PIE_DATA.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(6,15,30,0.95)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {PIE_DATA.map(({ name, value }, i) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i], flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1 }}>{name}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: COLORS[i], fontFamily: 'var(--font-mono)' }}>{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Power comparison */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>
            Power Consumption: Baseline vs AI-Optimized (W)
          </h3>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={POWER_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip contentStyle={{ background: 'rgba(6,15,30,0.95)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="power" name="Baseline (W)" fill="rgba(139,92,246,0.6)" radius={[4,4,0,0]} />
                <Bar dataKey="optimized" name="AI-Optimized (W)" fill="rgba(16,185,129,0.8)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
