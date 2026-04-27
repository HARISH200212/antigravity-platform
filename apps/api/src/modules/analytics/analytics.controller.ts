import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('analytics')
@Controller('api/v1/analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class AnalyticsController {
  constructor(private readonly svc: AnalyticsService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get platform-wide KPI metrics' })
  getMetrics() { return this.svc.getPlatformMetrics(); }

  @Get('power-series')
  @ApiOperation({ summary: 'Get power time series (baseline vs AI-optimized)' })
  getPower(@Query('points') points?: number) {
    return this.svc.getPowerTimeSeries(undefined, points ? +points : 60);
  }

  @Get('telemetry/:experimentId')
  @ApiOperation({ summary: 'Get telemetry aggregate stats for an experiment' })
  getAgg(@Param('experimentId') experimentId: string, @Query('windowMinutes') w?: number) {
    return this.svc.getTelemetryAggregates(experimentId, w ? +w : 60);
  }

  @Get('sensors/distribution')
  @ApiOperation({ summary: 'Get sensor type distribution' })
  getSensorDist() { return this.svc.getSensorDistribution(); }

  @Get('experiments/comparison')
  @ApiOperation({ summary: 'Compare experiments power and stability' })
  getComparison() { return this.svc.getExperimentComparison(); }
}
