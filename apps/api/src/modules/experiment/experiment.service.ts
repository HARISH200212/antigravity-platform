import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import type {
  ExperimentStatus, CoilConfig, SafetyThresholds
} from '../../types/domain.types';

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: ExperimentStatus;
  labGroup: string;
  researcher: string;
  tenantId: string;
  coilConfig: CoilConfig;
  safetyThresholds: SafetyThresholds;
  powerConsumption: number;
  stabilityScore: number;
  aiOptimized: boolean;
  parameterSnapshot?: string; // SHA-256 hash of config at run-start
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory store (replace with Prisma/TimescaleDB in production)
const EXPERIMENTS: Experiment[] = [
  {
    id: 'exp-001', name: 'Levitation Stability Alpha-7',
    description: 'Primary levitation trial with PPO-optimized coil config targeting 2kg payload at 15mm altitude.',
    status: 'RUNNING', labGroup: 'Propulsion Lab A', researcher: 'Dr. Elena Vasquez',
    tenantId: 'tenant-001',
    coilConfig: { coilA: 8.4, coilB: 7.9, coilC: 8.1, coilD: 8.3, frequency: 50, phase: 0 },
    safetyThresholds: { maxFluxDensity: 2.5, maxTemperature: 85, maxDisplacement: 25, minVoltage: 48, maxVoltage: 52 },
    powerConsumption: 342, stabilityScore: 94.7, aiOptimized: true,
    startedAt: new Date(Date.now() - 1000 * 60 * 47).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'exp-002', name: 'High-Flux Mapping Grid B',
    description: 'Field mapping across 3D grid of 512 probe points — 0.5T baseline coil array.',
    status: 'PAUSED', labGroup: 'Propulsion Lab B', researcher: 'Dr. Kenji Mori',
    tenantId: 'tenant-001',
    coilConfig: { coilA: 12.0, coilB: 12.0, coilC: 12.0, coilD: 12.0, frequency: 60, phase: 45 },
    safetyThresholds: { maxFluxDensity: 3.0, maxTemperature: 90, maxDisplacement: 10, minVoltage: 48, maxVoltage: 52 },
    powerConsumption: 487, stabilityScore: 78.2, aiOptimized: false,
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

// Valid state machine transitions
const TRANSITIONS: Partial<Record<ExperimentStatus, ExperimentStatus[]>> = {
  DRAFT: ['CONFIGURED'],
  CONFIGURED: ['RUNNING'],
  RUNNING: ['PAUSED', 'COMPLETED'],
  PAUSED: ['RUNNING', 'COMPLETED', 'ARCHIVED'],
  COMPLETED: ['ARCHIVED'],
};

@Injectable()
export class ExperimentService {
  private readonly logger = new Logger(ExperimentService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  findAll(tenantId: string, status?: ExperimentStatus): Experiment[] {
    return EXPERIMENTS
      .filter(e => e.tenantId === tenantId)
      .filter(e => !status || e.status === status);
  }

  findOne(id: string, tenantId: string): Experiment {
    const exp = EXPERIMENTS.find(e => e.id === id && e.tenantId === tenantId);
    if (!exp) throw new NotFoundException(`Experiment ${id} not found`);
    return exp;
  }

  create(dto: Partial<Experiment> & { name: string; labGroup: string; researcher: string; tenantId: string }): Experiment {
    const exp: Experiment = {
      id: uuidv4(),
      name: dto.name,
      description: dto.description || '',
      status: 'DRAFT',
      labGroup: dto.labGroup,
      researcher: dto.researcher,
      tenantId: dto.tenantId,
      coilConfig: dto.coilConfig || { coilA: 8.0, coilB: 8.0, coilC: 8.0, coilD: 8.0, frequency: 50, phase: 0 },
      safetyThresholds: dto.safetyThresholds || { maxFluxDensity: 2.5, maxTemperature: 85, maxDisplacement: 25, minVoltage: 48, maxVoltage: 52 },
      powerConsumption: 0, stabilityScore: 0, aiOptimized: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    EXPERIMENTS.push(exp);
    this.eventEmitter.emit('experiment.created', exp);
    this.logger.log(`Created experiment: ${exp.id} (${exp.name})`);
    return exp;
  }

  transition(id: string, tenantId: string, targetStatus: ExperimentStatus, actor: string): Experiment {
    const exp = this.findOne(id, tenantId);
    const allowed = TRANSITIONS[exp.status] || [];
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${exp.status} to ${targetStatus}. Allowed: ${allowed.join(', ')}`
      );
    }

    const prev = exp.status;
    exp.status = targetStatus;
    exp.updatedAt = new Date().toISOString();

    if (targetStatus === 'RUNNING') {
      exp.startedAt = new Date().toISOString();
      // Snapshot parameters at run-start
      exp.parameterSnapshot = createHash('sha256')
        .update(JSON.stringify({ ...exp.coilConfig, ...exp.safetyThresholds }))
        .digest('hex');
    }
    if (targetStatus === 'COMPLETED' || targetStatus === 'ARCHIVED') {
      exp.completedAt = new Date().toISOString();
    }

    this.eventEmitter.emit('experiment.status_changed', { exp, prev, targetStatus, actor });
    this.logger.log(`Experiment ${id}: ${prev} → ${targetStatus} (by ${actor})`);
    return exp;
  }

  updateCoilConfig(id: string, tenantId: string, config: Partial<CoilConfig>): Experiment {
    const exp = this.findOne(id, tenantId);
    exp.coilConfig = { ...exp.coilConfig, ...config };
    exp.updatedAt = new Date().toISOString();
    this.eventEmitter.emit('experiment.config_updated', { id, config });
    return exp;
  }

  updateSafetyThresholds(id: string, tenantId: string, thresholds: Partial<SafetyThresholds>): Experiment {
    const exp = this.findOne(id, tenantId);
    exp.safetyThresholds = { ...exp.safetyThresholds, ...thresholds };
    exp.updatedAt = new Date().toISOString();
    return exp;
  }

  getRunning(tenantId: string): Experiment[] {
    return EXPERIMENTS.filter(e => e.tenantId === tenantId && e.status === 'RUNNING');
  }
}
