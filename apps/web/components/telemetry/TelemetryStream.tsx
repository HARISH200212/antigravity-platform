'use client';
import { useEffect, useRef, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, LineChart, Line
} from 'recharts';
import { generateTelemetryHistory, generateTelemetryPoint } from '@/lib/mock-data';
import type { TelemetryDataPoint } from '@/lib/types';
import { Wifi, WifiOff } from 'lucide-react';

interface TelemetryStreamProps {
  metric: 'flux' | 'temperature' | 'displacement' | 'powerW';
  label: string;
  unit: string;
  color: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  showCurrentValue?: boolean;
}

const METRIC_COLORS: Record<string, string> = {
  flux: '#00d4ff',
  temperature: '#f59e0b',
  displacement: '#8b5cf6',
  powerW: '#10b981',
};

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(6,15,30,0.95)',
      border: '1px solid var(--border-default)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 12,
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>
        {new Date(label).toLocaleTimeString()}
      </div>
      <div style={{ color: payload[0].color, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
        {payload[0].value?.toFixed(3)} {unit}
      </div>
    </div>
  );
};

export function TelemetryStream({
  metric, label, unit, color, warningThreshold, criticalThreshold, showCurrentValue = true
}: TelemetryStreamProps) {
  const [data, setData] = useState<TelemetryDataPoint[]>(() => generateTelemetryHistory(80));
  const [connected, setConnected] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setData(prev => {
        const next = [...prev.slice(-79), generateTelemetryPoint(Date.now())];
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const current = data[data.length - 1]?.[metric] ?? 0;
  const isWarning = warningThreshold !== undefined && current > warningThreshold;
  const isCritical = criticalThreshold !== undefined && current > criticalThreshold;
  const statusColor = isCritical ? 'var(--accent-red)' : isWarning ? 'var(--accent-amber)' : color;

  const chartData = data.map(d => ({ time: d.timestamp, value: d[metric] }));

  return (
    <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {connected ? (
            <Wifi size={12} style={{ color: 'var(--accent-green)' }} />
          ) : (
            <WifiOff size={12} style={{ color: 'var(--accent-red)' }} />
          )}
          <span style={{ fontSize: 10, color: connected ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
            {connected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {showCurrentValue && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span className="metric-value" style={{
            color: statusColor,
            fontSize: 26,
            fontFamily: 'var(--font-mono)',
            transition: 'color 0.3s ease',
          }}>
            {current.toFixed(metric === 'powerW' ? 1 : 3)}
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{unit}</span>
          {isCritical && (
            <span className="badge badge-critical" style={{ marginLeft: 8 }}>CRITICAL</span>
          )}
          {isWarning && !isCritical && (
            <span className="badge badge-paused" style={{ marginLeft: 8 }}>WARNING</span>
          )}
        </div>
      )}

      <div style={{ height: 70 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 2, right: 0, left: -40, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={statusColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={statusColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.05)" />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={statusColor}
              strokeWidth={1.5}
              fill={`url(#grad-${metric})`}
              dot={false}
              animationDuration={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
