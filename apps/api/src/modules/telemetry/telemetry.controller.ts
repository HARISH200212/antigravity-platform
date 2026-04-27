import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TelemetryService } from './telemetry.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { SensorType } from '../../types/domain.types';

@ApiTags('telemetry')
@Controller('api/v1/telemetry')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class TelemetryController {
  constructor(private readonly svc: TelemetryService) {}

  @Post('ingest')
  @ApiOperation({ summary: 'Ingest a batch of sensor readings — validates, evaluates safety, fans-out via WebSocket' })
  ingest(@Body() batch: any) { return this.svc.ingest(batch); }

  @Get('recent/:experimentId')
  @ApiOperation({ summary: 'Get recent telemetry readings for an experiment' })
  getRecent(
    @Param('experimentId') experimentId: string,
    @Query('sensorType') sensorType?: SensorType,
    @Query('limit') limit?: number,
  ) {
    return this.svc.getRecent(experimentId, sensorType, limit ? +limit : 100);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get telemetry pipeline ingestion statistics' })
  getStats() { return this.svc.getStats(); }

  @Post('synthetic')
  @ApiOperation({ summary: 'Generate and ingest a synthetic telemetry batch (demo/testing)' })
  async ingestSynthetic(@Body() body: { experimentId?: string; tenantId?: string }) {
    const batch = this.svc.generateSyntheticBatch(body.experimentId, body.tenantId);
    return this.svc.ingest(batch);
  }
}
