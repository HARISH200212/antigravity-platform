import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { createHmac } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface NotificationRecord {
  id: string;
  type: 'SAFETY_ALERT' | 'EXPERIMENT_STATE' | 'AI_RESULT' | 'SYSTEM';
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  channel: 'IN_APP' | 'EMAIL' | 'WEBHOOK' | 'SMS';
  delivered: boolean;
  createdAt: string;
}

const NOTIFICATIONS: NotificationRecord[] = [];

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'whsec_dev_secret';

  @OnEvent('safety.alert')
  async onSafetyAlert(alert: any) {
    await this.create({
      type: 'SAFETY_ALERT',
      title: `Safety Alert: ${alert.title}`,
      message: alert.message,
      severity: alert.severity,
      channel: 'IN_APP',
    });
    if (alert.severity === 'CRITICAL') {
      await this.deliverWebhook({ event: 'safety.alert', data: alert });
    }
  }

  @OnEvent('experiment.status_changed')
  async onExperimentChange(payload: any) {
    await this.create({
      type: 'EXPERIMENT_STATE',
      title: `Experiment ${payload.exp.name}: ${payload.prev} → ${payload.targetStatus}`,
      message: `Status change by ${payload.actor}`,
      severity: 'INFO',
      channel: 'IN_APP',
    });
  }

  async create(dto: Omit<NotificationRecord, 'id' | 'delivered' | 'createdAt'>): Promise<NotificationRecord> {
    const n: NotificationRecord = { id: uuidv4(), ...dto, delivered: false, createdAt: new Date().toISOString() };
    NOTIFICATIONS.push(n);
    return n;
  }

  async deliverWebhook(payload: Record<string, any>): Promise<void> {
    const webhookUrl = process.env.WEBHOOK_URL;
    if (!webhookUrl) { this.logger.debug('No WEBHOOK_URL configured, skipping webhook delivery'); return; }

    const body = JSON.stringify(payload);
    const sig = createHmac('sha256', this.WEBHOOK_SECRET).update(body).digest('hex');
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-AGT-Signature-256': `sha256=${sig}` },
        body,
        signal: AbortSignal.timeout(5000),
      });
      this.logger.log(`Webhook delivered: ${res.status}`);
    } catch (e) {
      this.logger.error(`Webhook delivery failed: ${e.message}`);
    }
  }

  findAll(unread?: boolean): NotificationRecord[] {
    return NOTIFICATIONS
      .filter(n => !unread || !n.delivered)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  markRead(id: string): NotificationRecord {
    const n = NOTIFICATIONS.find(n => n.id === id);
    if (n) { n.delivered = true; }
    return n;
  }
}
