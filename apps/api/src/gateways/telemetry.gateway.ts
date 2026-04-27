import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

/**
 * WebSocket Gateway — namespace: /telemetry
 *
 * Client events received:
 *   subscribe_experiment  { experimentId: string }
 *   unsubscribe_experiment
 *
 * Server events emitted:
 *   telemetry_update      { experimentId, readings[] }
 *   safety_alert          AlertEvent
 *   experiment_state      { experimentId, status }
 *   hardware_command_ack  HardwareCommand
 */
@WebSocketGateway({
  namespace: '/telemetry',
  cors: {
    origin: ['http://localhost:3000', 'https://*.run.app'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class TelemetryGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(TelemetryGateway.name);
  private clients = 0;

  afterInit(server: Server) {
    this.logger.log('⚡ Telemetry WebSocket gateway initialized — /telemetry');
  }

  handleConnection(client: Socket) {
    this.clients++;
    this.logger.log(`Client connected: ${client.id} (total: ${this.clients})`);
    client.emit('connected', {
      message: 'AGT WebSocket gateway connected',
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.clients--;
    this.logger.log(`Client disconnected: ${client.id} (total: ${this.clients})`);
  }

  @SubscribeMessage('subscribe_experiment')
  handleSubscribe(client: Socket, @MessageBody() data: { experimentId: string }) {
    const room = `exp:${data.experimentId}`;
    client.join(room);
    this.logger.debug(`Client ${client.id} subscribed to ${room}`);
    client.emit('subscribed', { room, experimentId: data.experimentId });
  }

  @SubscribeMessage('unsubscribe_experiment')
  handleUnsubscribe(client: Socket, @MessageBody() data: { experimentId: string }) {
    const room = `exp:${data.experimentId}`;
    client.leave(room);
    client.emit('unsubscribed', { room });
  }

  // ─── Domain event listeners ───────────────────────────────────────────────

  @OnEvent('telemetry.ingested')
  handleTelemetryIngested(payload: { experimentId: string; readings: any[] }) {
    // Broadcast to all clients subscribed to this experiment room
    this.server.to(`exp:${payload.experimentId}`).emit('telemetry_update', {
      experimentId: payload.experimentId,
      readings: payload.readings,
      timestamp: new Date().toISOString(),
    });
  }

  @OnEvent('safety.alert')
  handleSafetyAlert(alert: any) {
    // Broadcast to all connected clients (safety alerts are platform-wide)
    this.server.emit('safety_alert', alert);
  }

  @OnEvent('experiment.status_changed')
  handleExperimentState(payload: any) {
    this.server.to(`exp:${payload.exp.id}`).emit('experiment_state', {
      experimentId: payload.exp.id,
      status: payload.targetStatus,
      previousStatus: payload.prev,
    });
  }

  @OnEvent('hardware.command_acked')
  handleCommandAck(cmd: any) {
    this.server.to(`exp:${cmd.experimentId}`).emit('hardware_command_ack', cmd);
  }

  getConnectedClients(): number { return this.clients; }
}
