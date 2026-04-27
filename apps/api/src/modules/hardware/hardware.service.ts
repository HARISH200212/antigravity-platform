import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import type { CommandType, CoilConfig } from '../../types/domain.types';

export interface HardwareCommand {
  id: string;
  experimentId: string;
  commandType: CommandType;
  payload: Record<string, any>;
  status: 'PENDING' | 'ACKNOWLEDGED' | 'FAILED';
  issuedAt: string;
  acknowledgedAt?: string;
  latencyMs?: number;
  issuedBy: string;
}

// Mock hardware bridge state
const COMMAND_LOG: HardwareCommand[] = [
  {
    id: 'cmd-001', experimentId: 'exp-001', commandType: 'SET_CURRENT',
    payload: { coilA: 8.4, coilB: 7.9, coilC: 8.1, coilD: 8.3 },
    status: 'ACKNOWLEDGED',
    issuedAt: new Date(Date.now() - 1000 * 60 * 47).toISOString(),
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 47 + 4).toISOString(),
    latencyMs: 4.2, issuedBy: 'Dr. E. Vasquez',
  },
];

let BRIDGE_ONLINE = true;

@Injectable()
export class HardwareService {
  private readonly logger = new Logger(HardwareService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  getStatus() {
    return {
      online: BRIDGE_ONLINE,
      protocol: 'CAN-FD 5Mbps',
      lastHeartbeat: new Date().toISOString(),
      latencyMs: BRIDGE_ONLINE ? +(2 + Math.random() * 5).toFixed(2) : null,
      errorRate: 0.0,
      commandsLastMinute: COMMAND_LOG.filter(
        c => Date.now() - new Date(c.issuedAt).getTime() < 60000
      ).length,
    };
  }

  async dispatchCommand(
    experimentId: string,
    commandType: CommandType,
    payload: Record<string, any>,
    issuedBy: string,
  ): Promise<HardwareCommand> {
    if (!BRIDGE_ONLINE && commandType !== 'EMERGENCY_STOP') {
      throw new ServiceUnavailableException('Hardware bridge offline');
    }

    const cmd: HardwareCommand = {
      id: uuidv4(), experimentId, commandType, payload,
      status: 'PENDING',
      issuedAt: new Date().toISOString(),
      issuedBy,
    };
    COMMAND_LOG.unshift(cmd);

    // Simulate CAN bus round-trip: 2–9ms
    const latency = 2 + Math.random() * 7;
    await new Promise(r => setTimeout(r, latency));

    cmd.status = 'ACKNOWLEDGED';
    cmd.acknowledgedAt = new Date().toISOString();
    cmd.latencyMs = +latency.toFixed(2);

    this.eventEmitter.emit('hardware.command_acked', cmd);
    this.logger.log(`CMD ${commandType} on ${experimentId}: ACK in ${cmd.latencyMs}ms`);
    return cmd;
  }

  async emergencyStop(experimentId: string, reason: string, issuedBy: string): Promise<HardwareCommand> {
    this.logger.warn(`🚨 EMERGENCY STOP — Experiment ${experimentId}: ${reason}`);
    const cmd = await this.dispatchCommand(
      experimentId, 'EMERGENCY_STOP', { reason, allCurrentsZero: true }, issuedBy
    );
    this.eventEmitter.emit('safety.emergency_stop', { experimentId, reason, cmd });
    return cmd;
  }

  getCommandLog(experimentId?: string): HardwareCommand[] {
    return experimentId
      ? COMMAND_LOG.filter(c => c.experimentId === experimentId)
      : COMMAND_LOG;
  }
}
