// Mock data generators for demo — simulates live sensor feeds, experiments, and system state

import type {
  Experiment,
  TelemetryDataPoint,
  AlertEvent,
  AuditEntry,
  DashboardMetrics,
  SimulationJob,
  OptimizationResult,
  HardwareCommand,
} from './types';

// ─── EXPERIMENTS ─────────────────────────────────────────────────────────────
export const MOCK_EXPERIMENTS: Experiment[] = [
  {
    id: 'exp-001',
    name: 'Levitation Stability Alpha-7',
    description: 'Primary levitation trial with PPO-optimized coil config targeting 2kg payload at 15mm altitude.',
    status: 'RUNNING',
    labGroup: 'Propulsion Lab A',
    researcher: 'Dr. Elena Vasquez',
    startedAt: new Date(Date.now() - 1000 * 60 * 47).toISOString(),
    coilConfig: { coilA: 8.4, coilB: 7.9, coilC: 8.1, coilD: 8.3, frequency: 50, phase: 0 },
    safetyThresholds: { maxFluxDensity: 2.5, maxTemperature: 85, maxDisplacement: 25, minVoltage: 48, maxVoltage: 52 },
    powerConsumption: 342,
    stabilityScore: 94.7,
    aiOptimized: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'exp-002',
    name: 'High-Flux Mapping Grid B',
    description: 'Field mapping across 3D grid of 512 probe points — 0.5T baseline coil array.',
    status: 'PAUSED',
    labGroup: 'Propulsion Lab B',
    researcher: 'Dr. Kenji Mori',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    coilConfig: { coilA: 12.0, coilB: 12.0, coilC: 12.0, coilD: 12.0, frequency: 60, phase: 45 },
    safetyThresholds: { maxFluxDensity: 3.0, maxTemperature: 90, maxDisplacement: 10, minVoltage: 48, maxVoltage: 52 },
    powerConsumption: 487,
    stabilityScore: 78.2,
    aiOptimized: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'exp-003',
    name: 'Thermal Runaway Threshold Test',
    description: 'Controlled thermal stress test up to 80°C coil temperature — safety compliance verification.',
    status: 'COMPLETED',
    labGroup: 'Safety Systems',
    researcher: 'Capt. Aiyana Redcloud',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    coilConfig: { coilA: 15.0, coilB: 15.0, coilC: 15.0, coilD: 15.0, frequency: 50, phase: 0 },
    safetyThresholds: { maxFluxDensity: 4.0, maxTemperature: 82, maxDisplacement: 5, minVoltage: 48, maxVoltage: 52 },
    powerConsumption: 612,
    stabilityScore: 60.1,
    aiOptimized: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: 'exp-004',
    name: 'PPO Optimization Benchmark v3',
    description: 'Benchmarking RL agent PPO v3 against baseline — targeting ≥20% power reduction at stable levitation.',
    status: 'DRAFT',
    labGroup: 'AI Research',
    researcher: 'Dr. Saoirse O\'Brien',
    coilConfig: { coilA: 8.0, coilB: 8.0, coilC: 8.0, coilD: 8.0, frequency: 50, phase: 0 },
    safetyThresholds: { maxFluxDensity: 2.5, maxTemperature: 80, maxDisplacement: 20, minVoltage: 48, maxVoltage: 52 },
    powerConsumption: 0,
    stabilityScore: 0,
    aiOptimized: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 'exp-005',
    name: 'Coil Resonance Frequency Sweep',
    description: 'Frequency sweep from 40–70Hz to identify resonance peaks and optimal operating frequency.',
    status: 'ARCHIVED',
    labGroup: 'Propulsion Lab A',
    researcher: 'Dr. Elena Vasquez',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 44).toISOString(),
    coilConfig: { coilA: 6.0, coilB: 6.0, coilC: 6.0, coilD: 6.0, frequency: 55, phase: 0 },
    safetyThresholds: { maxFluxDensity: 2.0, maxTemperature: 75, maxDisplacement: 30, minVoltage: 48, maxVoltage: 52 },
    powerConsumption: 280,
    stabilityScore: 88.5,
    aiOptimized: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 44).toISOString(),
  },
];

// ─── TELEMETRY DATA GENERATOR ─────────────────────────────────────────────────
export function generateTelemetryPoint(t: number, baselineOffset = 0): TelemetryDataPoint {
  const noise = () => (Math.random() - 0.5) * 0.04;
  const slowWave = Math.sin(t * 0.001 + baselineOffset);
  const fastWave = Math.sin(t * 0.008);

  return {
    timestamp: t,
    flux: parseFloat((1.82 + slowWave * 0.15 + noise()).toFixed(4)),
    temperature: parseFloat((52.4 + slowWave * 4.2 + noise() * 2).toFixed(2)),
    displacement: parseFloat((14.8 + fastWave * 1.1 + noise() * 0.5).toFixed(3)),
    accelX: parseFloat((noise() * 0.3).toFixed(4)),
    accelY: parseFloat((noise() * 0.3).toFixed(4)),
    accelZ: parseFloat((9.81 + noise() * 0.05).toFixed(4)),
    coilCurrentA: parseFloat((8.4 + noise() * 0.1).toFixed(3)),
    coilCurrentB: parseFloat((7.9 + noise() * 0.1).toFixed(3)),
    coilCurrentC: parseFloat((8.1 + noise() * 0.1).toFixed(3)),
    coilCurrentD: parseFloat((8.3 + noise() * 0.1).toFixed(3)),
    powerW: parseFloat((342 + slowWave * 18 + noise() * 5).toFixed(1)),
  };
}

export function generateTelemetryHistory(points = 120): TelemetryDataPoint[] {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) =>
    generateTelemetryPoint(now - (points - i) * 1000)
  );
}

// ─── FIELD VECTORS ────────────────────────────────────────────────────────────
export function generateFieldVectors(gridSize = 8) {
  const vectors = [];
  for (let x = -gridSize/2; x < gridSize/2; x++) {
    for (let y = -gridSize/2; y < gridSize/2; y++) {
      for (let z = -gridSize/2; z < gridSize/2; z += 2) {
        const dist = Math.sqrt(x*x + y*y + (z-0.5)*(z-0.5)) + 0.01;
        const magnitude = 1.8 / (dist * dist);
        const fx = -x / (dist * dist * dist) * 1.8;
        const fy = -y / (dist * dist * dist) * 1.8;
        const fz = -(z - 0.5) / (dist * dist * dist) * 1.8;
        vectors.push({ x, y, z, fx, fy, fz, magnitude: Math.min(magnitude, 2.5) });
      }
    }
  }
  return vectors;
}

// ─── ALERT EVENTS ─────────────────────────────────────────────────────────────
export const MOCK_ALERTS: AlertEvent[] = [
  {
    id: 'alt-001',
    experimentId: 'exp-001',
    severity: 'WARNING',
    title: 'Flux Density Approaching Threshold',
    message: 'Coil A flux density at 2.31T — 92% of max threshold (2.5T). Monitor closely.',
    sensorType: 'FLUX',
    value: 2.31,
    threshold: 2.5,
    acknowledged: false,
    triggeredAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
  {
    id: 'alt-002',
    experimentId: 'exp-002',
    severity: 'CRITICAL',
    title: 'Emergency Stop Triggered — Temperature Breach',
    message: 'Coil B temperature reached 91.4°C, exceeding 90°C threshold. Hardware stop issued. Experiment paused.',
    sensorType: 'THERMAL',
    value: 91.4,
    threshold: 90,
    acknowledged: true,
    triggeredAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'alt-003',
    severity: 'INFO',
    title: 'AI Optimizer Model Retrained',
    message: 'PPO agent v3.2 training completed. Avg reward improvement: +18.4%. Model deployed to staging.',
    acknowledged: true,
    triggeredAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
  },
  {
    id: 'alt-004',
    experimentId: 'exp-001',
    severity: 'WARNING',
    title: 'Kafka Consumer Lag Spike',
    message: 'Telemetry consumer lag exceeded 5,000 messages (28.4s). Auto-scaling consumer pods.',
    acknowledged: false,
    triggeredAt: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
  },
];

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────
export const MOCK_AUDIT: AuditEntry[] = [
  { id: 'aud-001', userId: 'usr-003', userName: 'Capt. A. Redcloud', action: 'EMERGENCY_STOP', resource: 'Experiment', resourceId: 'exp-002', payload: { reason: 'thermal_breach', temp: 91.4 }, hashChain: 'sha256:a3f9...e271', ipAddress: '10.0.1.42', timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString() },
  { id: 'aud-002', userId: 'usr-001', userName: 'Dr. E. Vasquez', action: 'START_EXPERIMENT', resource: 'Experiment', resourceId: 'exp-001', hashChain: 'sha256:b7c4...d983', ipAddress: '10.0.1.15', timestamp: new Date(Date.now() - 1000 * 60 * 47).toISOString() },
  { id: 'aud-003', userId: 'usr-004', userName: 'Dr. S. O\'Brien', action: 'APPLY_AI_CONFIG', resource: 'CoilConfig', resourceId: 'exp-001', payload: { before: { coilA: 9.0 }, after: { coilA: 8.4 }, powerReduction: '22.1%' }, hashChain: 'sha256:c2d1...f044', ipAddress: '10.0.1.20', timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString() },
  { id: 'aud-004', userId: 'usr-002', userName: 'Dr. K. Mori', action: 'PAUSE_EXPERIMENT', resource: 'Experiment', resourceId: 'exp-002', hashChain: 'sha256:d5e8...a129', ipAddress: '10.0.1.31', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: 'aud-005', userId: 'usr-005', userName: 'Lab Admin', action: 'USER_CREATED', resource: 'User', resourceId: 'usr-006', payload: { role: 'RESEARCHER', labGroup: 'Propulsion Lab C' }, hashChain: 'sha256:e9f2...b367', ipAddress: '10.0.1.1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
];

// ─── HARDWARE COMMANDS ────────────────────────────────────────────────────────
export const MOCK_COMMANDS: HardwareCommand[] = [
  { id: 'cmd-001', experimentId: 'exp-001', commandType: 'SET_CURRENT', payload: { coilA: 8.4, coilB: 7.9, coilC: 8.1, coilD: 8.3 }, status: 'ACKNOWLEDGED', issuedAt: new Date(Date.now() - 1000 * 60 * 47).toISOString(), acknowledgedAt: new Date(Date.now() - 1000 * 60 * 47 + 4).toISOString(), issuedBy: 'Dr. E. Vasquez' },
  { id: 'cmd-002', experimentId: 'exp-002', commandType: 'EMERGENCY_STOP', payload: { reason: 'thermal_breach' }, status: 'ACKNOWLEDGED', issuedAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(), acknowledgedAt: new Date(Date.now() - 1000 * 60 * 32 + 7).toISOString(), issuedBy: 'Safety Watchdog' },
];

// ─── DASHBOARD METRICS ────────────────────────────────────────────────────────
export const MOCK_METRICS: DashboardMetrics = {
  activeExperiments: 1,
  totalSensorEvents: 2_847_392,
  safetyAlertsToday: 3,
  avgPowerConsumption: 342,
  aiOptimizationSavings: 22.1,
  hardwareOnline: true,
  kafkaLag: 142,
  uptime: 99.94,
};

// ─── SIMULATION JOB ───────────────────────────────────────────────────────────
export const MOCK_SIMULATION_JOB: SimulationJob = {
  id: 'sim-001',
  experimentId: 'exp-001',
  status: 'COMPLETED',
  progress: 100,
  fieldVectors: generateFieldVectors(6),
  createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  completedAt: new Date(Date.now() - 1000 * 60 * 88).toISOString(),
};

// ─── OPTIMIZATION RESULT ──────────────────────────────────────────────────────
export const MOCK_OPTIMIZATION: OptimizationResult = {
  runId: 'opt-001',
  suggestedConfig: { coilA: 7.9, coilB: 7.4, coilC: 7.6, coilD: 7.8, frequency: 50, phase: 0 },
  estimatedPowerReduction: 22.1,
  estimatedStabilityGain: 3.4,
  confidence: 0.94,
};
