import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { HardwareService } from '../hardware/hardware.service';
import { AuditService } from '../audit/audit.service';
import type { AlertSeverity, SensorType } from '../../types/domain.types';

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

export interface SafetyThresholdCheck {
  experimentId: string;
  sensorType: SensorType;
  value: number;
  maxThreshold: number;
  tenantId: string;
  issuedBy: string;
}

const ALERT_STORE: AlertEvent[] = [];

@Injectable()
export class SafetyService {
  private readonly logger = new Logger(SafetyService.name);
  private readonly WATCHDOG_RESPONSE_TARGET_MS = 10;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly hardware: HardwareService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Core safety evaluation — called by TelemetryModule on every sensor reading.
   * Target: <10ms from breach detection to hardware emergency stop.
   */
  async evaluateThreshold(check: SafetyThresholdCheck): Promise<AlertEvent | null> {
    if (check.value <= check.maxThreshold) return null;

    const t0 = performance.now();
    const severity: AlertSeverity = check.value > check.maxThreshold * 1.05 ? 'CRITICAL' : 'WARNING';

    const alert: AlertEvent = {
      id: uuidv4(),
      experimentId: check.experimentId,
      severity,
      title: `${check.sensorType} Threshold Breach`,
      message: `${check.sensorType} value ${check.value.toFixed(3)} exceeded threshold ${check.maxThreshold.toFixed(3)}`,
      sensorType: check.sensorType,
      value: check.value,
      threshold: check.maxThreshold,
      acknowledged: false,
      triggeredAt: new Date().toISOString(),
    };
    ALERT_STORE.push(alert);

    if (severity === 'CRITICAL') {
      // Direct-path emergency stop — bypasses normal command queue
      await this.hardware.emergencyStop(
        check.experimentId,
        `Auto-triggered: ${check.sensorType} = ${check.value.toFixed(3)} > ${check.maxThreshold}`,
        'Safety Watchdog',
      );

      // Write immutable audit entry
      await this.audit.log({
        userId: 'system', userName: 'Safety Watchdog',
        action: 'EMERGENCY_STOP',
        resource: 'Experiment', resourceId: check.experimentId,
        payload: { sensorType: check.sensorType, value: check.value, threshold: check.maxThreshold },
        ipAddress: '127.0.0.1',
      });
    }

    const responseMs = performance.now() - t0;
    this.logger.warn(
      `⚠️ Safety breach [${severity}] — ${check.sensorType}: ${check.value.toFixed(3)} / ${check.maxThreshold} | Response: ${responseMs.toFixed(2)}ms`
    );

    if (responseMs > this.WATCHDOG_RESPONSE_TARGET_MS) {
      this.logger.error(`Safety response time ${responseMs.toFixed(2)}ms exceeded 10ms SLA target!`);
    }

    this.eventEmitter.emit('safety.alert', alert);
    return alert;
  }

  acknowledge(id: string, actor: string): AlertEvent {
    const alert = ALERT_STORE.find(a => a.id === id);
    if (!alert) return null;
    alert.acknowledged = true;
    alert.acknowledgedAt = new Date().toISOString();
    this.logger.log(`Alert ${id} acknowledged by ${actor}`);
    return alert;
  }

  getAlerts(experimentId?: string, unacknowledgedOnly = false): AlertEvent[] {
    return ALERT_STORE
      .filter(a => !experimentId || a.experimentId === experimentId)
      .filter(a => !unacknowledgedOnly || !a.acknowledged)
      .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());
  }

  getWatchdogStatus() {
    return {
      cloudWatchdog: 'ACTIVE',
      edgeWatchdog: 'ACTIVE',
      hwInterlock: 'ACTIVE',
      responseTargetMs: this.WATCHDOG_RESPONSE_TARGET_MS,
      complianceStandard: 'IEEE 1584 / IEC 61010',
      totalAlerts: ALERT_STORE.length,
      unacknowledged: ALERT_STORE.filter(a => !a.acknowledged).length,
    };
  }
}
