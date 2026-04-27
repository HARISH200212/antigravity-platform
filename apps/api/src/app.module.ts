import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './modules/auth/auth.module';
import { ExperimentModule } from './modules/experiment/experiment.module';
import { HardwareModule } from './modules/hardware/hardware.module';
import { TelemetryModule } from './modules/telemetry/telemetry.module';
import { SafetyModule } from './modules/safety/safety.module';
import { SimulationModule } from './modules/simulation/simulation.module';
import { OptimizerModule } from './modules/optimizer/optimizer.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuditModule } from './modules/audit/audit.module';
import { NotificationModule } from './modules/notification/notification.module';
import { HealthModule } from './modules/health/health.module';
import { TelemetryGateway } from './gateways/telemetry.gateway';

@Module({
  imports: [
    // Config — loads .env
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),

    // Rate limiting — Redis sliding window (falls back to in-memory for demo)
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 20 },
      { name: 'long',  ttl: 60000, limit: 500 },
    ]),

    // Domain events
    EventEmitterModule.forRoot({ wildcard: true, maxListeners: 20 }),

    // Feature modules
    AuthModule,
    ExperimentModule,
    HardwareModule,
    TelemetryModule,
    SafetyModule,
    SimulationModule,
    OptimizerModule,
    AnalyticsModule,
    AuditModule,
    NotificationModule,
    HealthModule,
  ],
  providers: [TelemetryGateway],
})
export class AppModule {}
