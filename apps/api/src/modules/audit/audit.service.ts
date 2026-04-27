import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  payload?: Record<string, any>;
  hashChain: string;  // SHA-256(prevHash + payload)
  prevHash: string;
  ipAddress: string;
  timestamp: string;
}

export interface AuditLogDto {
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  payload?: Record<string, any>;
  ipAddress: string;
}

// Append-only log — never mutated after insert
const AUDIT_LOG: AuditEntry[] = [
  {
    id: 'aud-001', userId: 'usr-003', userName: 'Capt. A. Redcloud',
    action: 'EMERGENCY_STOP', resource: 'Experiment', resourceId: 'exp-002',
    payload: { reason: 'thermal_breach', temp: 91.4 },
    hashChain: 'sha256:a3f9c2d1b4e8f7a0c5d2e9b6f3a8d1c4e7b2f5a8c1d4e7',
    prevHash: 'sha256:000000000000000000000000000000000000000000000000',
    ipAddress: '10.0.1.42',
    timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
  },
];

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  /**
   * Appends an immutable audit entry with SHA-256 hash chaining.
   * Each entry's hash = SHA-256(prevHash + action + resourceId + timestamp)
   */
  async log(dto: AuditLogDto): Promise<AuditEntry> {
    const prevEntry = AUDIT_LOG[AUDIT_LOG.length - 1];
    const prevHash = prevEntry?.hashChain ?? 'sha256:' + '0'.repeat(64);

    const timestamp = new Date().toISOString();
    const chainInput = `${prevHash}|${dto.action}|${dto.resourceId ?? ''}|${timestamp}`;
    const hashChain = 'sha256:' + createHash('sha256').update(chainInput).digest('hex');

    const entry: AuditEntry = {
      id: uuidv4(),
      userId: dto.userId,
      userName: dto.userName,
      action: dto.action,
      resource: dto.resource,
      resourceId: dto.resourceId ?? '',
      payload: dto.payload,
      hashChain,
      prevHash,
      ipAddress: dto.ipAddress,
      timestamp,
    };

    // Append-only — no update/delete ever
    AUDIT_LOG.push(entry);
    this.logger.log(`Audit: ${dto.action} on ${dto.resource}/${dto.resourceId} by ${dto.userName}`);
    return entry;
  }

  /**
   * Verifies the entire hash chain for tamper detection.
   */
  verifyIntegrity(): { valid: boolean; entriesChecked: number; firstTamperedId?: string } {
    for (let i = 1; i < AUDIT_LOG.length; i++) {
      const prev = AUDIT_LOG[i - 1];
      const curr = AUDIT_LOG[i];
      const chainInput = `${prev.hashChain}|${curr.action}|${curr.resourceId}|${curr.timestamp}`;
      const expected = 'sha256:' + createHash('sha256').update(chainInput).digest('hex');
      if (curr.hashChain !== expected) {
        return { valid: false, entriesChecked: i, firstTamperedId: curr.id };
      }
    }
    return { valid: true, entriesChecked: AUDIT_LOG.length };
  }

  findAll(options?: { action?: string; userId?: string; resource?: string; limit?: number }): AuditEntry[] {
    let entries = [...AUDIT_LOG];
    if (options?.action) entries = entries.filter(e => e.action.includes(options.action));
    if (options?.userId) entries = entries.filter(e => e.userId === options.userId);
    if (options?.resource) entries = entries.filter(e => e.resource === options.resource);
    return entries
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, options?.limit ?? 100);
  }

  count(): number { return AUDIT_LOG.length; }
}
