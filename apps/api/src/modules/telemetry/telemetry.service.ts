import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SafetyService } from '../safety/safety.service';
import type { SensorType } from '../../types/domain.types';

export interface SensorReading {
  id: string;
  experimentId: string;
  sensorType: SensorType;
  value: number;
  unit: string;
  timestamp: string;
  tenantId: string;
  isAnomaly: boolean;
}

export interface TelemetryBatch {
  experimentId: string;
  tenantId: string;
  readings: Omit<SensorReading, 'id' | 'isAnomaly'>[];
}

// Rolling in-memory telemetry buffer — 10K readings per experiment
const TELEMETRY_BUFFER = new Map<string, SensorReading[]>();

// Safety threshold map per experiment (simplified — in production comes from DB)
const SAFETY_THRESHOLDS: Record<string, Record<SensorType, number>> = {
  'exp-001': { HALL_EFFECT: 3.0, FLUX: 2.5, THERMAL: 85, ACCELEROMETER: 50 },
  'exp-002': { HALL_EFFECT: 3.0, FLUX: 3.0, THERMAL: 90, ACCELEROMETER: 50 },
};

const SENSOR_UNITS: Record<SensorType, string> = {
  HALL_EFFECT: 'T', FLUX: 'T', THERMAL: '°C', ACCELEROMETER: 'm/s²'
};

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);
  private totalIngested = 0;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly safety: SafetyService,
  ) {}

  /**
   * Ingest a batch of sensor readings.
   * For each reading: validate → write buffer → evaluate safety thresholds → fan-out via EventEmitter2.
   * In production: Kafka consumer → TimescaleDB → Redis pub/sub.
   */
  async ingest(batch: TelemetryBatch): Promise<{ ingested: number; anomalies: number; safetyAlerts: number }> {
    let anomalies = 0, safetyAlerts = 0;
    const thresholds = SAFETY_THRESHOLDS[batch.experimentId];

    const processed: SensorReading[] = [];
    for (const raw of batch.readings) {
      // Simple anomaly detection: z-score based on recent readings
      const recent = this.getRecent(batch.experimentId, raw.sensorType, 20);
      const mean = recent.reduce((s, r) => s + r.value, 0) / (recent.length || 1);
      const std = Math.sqrt(recent.reduce((s, r) => s + Math.pow(r.value - mean, 2), 0) / (recent.length || 1));
      const isAnomaly = std > 0 && Math.abs(raw.value - mean) > 3 * std;
      if (isAnomaly) anomalies++;

      const reading: SensorReading = {
        ...raw,
        id: `${batch.experimentId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        isAnomaly,
        unit: raw.unit || SENSOR_UNITS[raw.sensorType] || '?',
      };
      processed.push(reading);

      // Safety threshold evaluation
      if (thresholds?.[raw.sensorType]) {
        const alert = await this.safety.evaluateThreshold({
          experimentId: batch.experimentId,
          sensorType: raw.sensorType,
          value: raw.value,
          maxThreshold: thresholds[raw.sensorType],
          tenantId: batch.tenantId,
          issuedBy: 'telemetry-pipeline',
        });
        if (alert) safetyAlerts++;
      }
    }

    // Write to buffer
    const buf = TELEMETRY_BUFFER.get(batch.experimentId) ?? [];
    buf.push(...processed);
    if (buf.length > 10000) buf.splice(0, buf.length - 10000); // evict oldest
    TELEMETRY_BUFFER.set(batch.experimentId, buf);

    this.totalIngested += processed.length;

    // Fan-out to WebSocket clients via EventEmitter2 → TelemetryGateway
    this.eventEmitter.emit('telemetry.ingested', {
      experimentId: batch.experimentId,
      readings: processed,
    });

    return { ingested: processed.length, anomalies, safetyAlerts };
  }

  getRecent(experimentId: string, sensorType: SensorType, limit = 100): SensorReading[] {
    const buf = TELEMETRY_BUFFER.get(experimentId) ?? [];
    return buf
      .filter(r => !sensorType || r.sensorType === sensorType)
      .slice(-limit);
  }

  getStats() {
    return {
      totalIngested: this.totalIngested,
      bufferedExperiments: TELEMETRY_BUFFER.size,
      bufferedReadings: [...TELEMETRY_BUFFER.values()].reduce((s, b) => s + b.length, 0),
      ingestRatePer_s: 'real-time',
    };
  }

  /** Generates a synthetic telemetry batch for demo/testing */
  generateSyntheticBatch(experimentId = 'exp-001', tenantId = 'tenant-001'): TelemetryBatch {
    const now = new Date().toISOString();
    const wave = Math.sin(Date.now() * 0.001);
    const noise = () => (Math.random() - 0.5) * 0.04;
    return {
      experimentId, tenantId,
      readings: [
        { experimentId, sensorType: 'FLUX', value: +(1.82 + wave * 0.15 + noise()).toFixed(4), unit: 'T', timestamp: now, tenantId },
        { experimentId, sensorType: 'THERMAL', value: +(52.4 + wave * 4.2 + noise()).toFixed(2), unit: '°C', timestamp: now, tenantId },
        { experimentId, sensorType: 'HALL_EFFECT', value: +(1.7 + wave * 0.1 + noise()).toFixed(4), unit: 'T', timestamp: now, tenantId },
        { experimentId, sensorType: 'ACCELEROMETER', value: +(9.81 + noise() * 0.1).toFixed(4), unit: 'm/s²', timestamp: now, tenantId },
      ],
    };
  }
}
