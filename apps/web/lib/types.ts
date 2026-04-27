// Shared type definitions for the AntiGravity platform

export type ExperimentStatus =
  | 'DRAFT'
  | 'CONFIGURED'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'ARCHIVED';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'LAB_ADMIN'
  | 'RESEARCHER'
  | 'HARDWARE_OPERATOR'
  | 'SAFETY_OFFICER'
  | 'AUDITOR';

export type SensorType = 'HALL_EFFECT' | 'FLUX' | 'THERMAL' | 'ACCELEROMETER';

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: ExperimentStatus;
  labGroup: string;
  researcher: string;
  startedAt?: string;
  completedAt?: string;
  coilConfig: CoilConfig;
  safetyThresholds: SafetyThresholds;
  powerConsumption: number;
  stabilityScore: number;
  aiOptimized: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CoilConfig {
  coilA: number;  // Amperes
  coilB: number;
  coilC: number;
  coilD: number;
  frequency: number; // Hz
  phase: number;     // degrees
}

export interface SafetyThresholds {
  maxFluxDensity: number;    // Tesla
  maxTemperature: number;    // Celsius
  maxDisplacement: number;   // mm
  minVoltage: number;        // V
  maxVoltage: number;        // V
}

export interface SensorReading {
  id: string;
  experimentId: string;
  sensorType: SensorType;
  value: number;
  unit: string;
  timestamp: string;
  isAnomaly: boolean;
}

export interface TelemetryDataPoint {
  timestamp: number;
  flux: number;
  temperature: number;
  displacement: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  coilCurrentA: number;
  coilCurrentB: number;
  coilCurrentC: number;
  coilCurrentD: number;
  powerW: number;
}

export interface AlertEvent {
  id: string;
  experimentId?: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  sensorType?: SensorType;
  value?: number;
  threshold?: number;
  acknowledged: boolean;
  triggeredAt: string;
  acknowledgedAt?: string;
}

export interface HardwareCommand {
  id: string;
  experimentId: string;
  commandType: 'SET_CURRENT' | 'EMERGENCY_STOP' | 'CALIBRATE' | 'RESET';
  payload: Record<string, unknown>;
  status: 'PENDING' | 'ACKNOWLEDGED' | 'FAILED';
  issuedAt: string;
  acknowledgedAt?: string;
  issuedBy: string;
}

export interface SimulationJob {
  id: string;
  experimentId: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
  fieldVectors?: FieldVector[];
  createdAt: string;
  completedAt?: string;
}

export interface FieldVector {
  x: number;
  y: number;
  z: number;
  fx: number;
  fy: number;
  fz: number;
  magnitude: number;
}

export interface OptimizationResult {
  runId: string;
  suggestedConfig: CoilConfig;
  estimatedPowerReduction: number;  // percent
  estimatedStabilityGain: number;   // percent
  confidence: number;               // 0-1
  appliedAt?: string;
}

export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  payload?: Record<string, unknown>;
  hashChain: string;
  ipAddress: string;
  timestamp: string;
}

export interface DashboardMetrics {
  activeExperiments: number;
  totalSensorEvents: number;
  safetyAlertsToday: number;
  avgPowerConsumption: number;
  aiOptimizationSavings: number;
  hardwareOnline: boolean;
  kafkaLag: number;
  uptime: number;
}

export interface NotificationPreference {
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  webhookUrl?: string;
  inAppEnabled: boolean;
  categories: {
    safetyBreaches: boolean;
    experimentStateChanges: boolean;
    modelTrainingComplete: boolean;
    hardwareErrors: boolean;
  };
}
