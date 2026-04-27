import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SafetyService } from './safety.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('safety')
@Controller('api/v1/safety')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class SafetyController {
  constructor(private readonly svc: SafetyService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get safety watchdog status and statistics' })
  getStatus() { return this.svc.getWatchdogStatus(); }

  @Get('alerts')
  @ApiOperation({ summary: 'List safety alerts' })
  getAlerts(
    @Query('experimentId') experimentId?: string,
    @Query('unacknowledgedOnly') unacknowledgedOnly?: string,
  ) {
    return this.svc.getAlerts(experimentId, unacknowledgedOnly === 'true');
  }

  @Patch('alerts/:id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge a safety alert' })
  acknowledge(@Param('id') id: string, @Request() req: any) {
    return this.svc.acknowledge(id, req.user.email);
  }

  @Post('evaluate')
  @ApiOperation({ summary: 'Manually trigger a threshold evaluation (for testing)' })
  evaluate(@Body() body: any) {
    return this.svc.evaluateThreshold(body);
  }
}
