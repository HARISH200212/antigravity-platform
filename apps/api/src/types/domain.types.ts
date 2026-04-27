export type UserRole =
  | 'SUPER_ADMIN' | 'LAB_ADMIN' | 'RESEARCHER'
  | 'HARDWARE_OPERATOR' | 'SAFETY_OFFICER' | 'AUDITOR';

export type ExperimentStatus =
  | 'DRAFT' | 'CONFIGURED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';

export type CommandType =
  | 'SET_CURRENT' | 'EMERGENCY_STOP' | 'CALIBRATE' | 'RESET';

export type CommandStatus = 'PENDING' | 'ACKNOWLEDGED' | 'FAILED';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type SensorType =
  | 'HALL_EFFECT' | 'FLUX' | 'THERMAL' | 'ACCELEROMETER';

export interface CoilConfig {
  coilA: number; coilB: number; coilC: number; coilD: number;
  frequency: number; phase: number;
}

export interface SafetyThresholds {
  maxFluxDensity: number;
  maxTemperature: number;
  maxDisplacement: number;
  minVoltage: number;
  maxVoltage: number;
}

export interface TelemetryPayload {
  experimentId: string;
  sensorType: SensorType;
  value: number;
  unit: string;
  timestamp: string;
  tenantId: string;
}
