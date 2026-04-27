import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SimulationService } from './simulation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('simulation')
@Controller('api/v1/simulation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class SimulationController {
  constructor(private readonly svc: SimulationService) {}

  @Post('jobs')
  @ApiOperation({ summary: 'Submit a new simulation job' })
  submit(@Body() body: { experimentId: string; coilConfig: Record<string, number> }) {
    return this.svc.submit(body.experimentId, body.coilConfig);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'List simulation jobs' })
  list(@Query('experimentId') experimentId?: string) { return this.svc.listJobs(experimentId); }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get simulation job status and results' })
  getJob(@Param('id') id: string) { return this.svc.getJob(id); }

  @Delete('jobs/:id')
  @ApiOperation({ summary: 'Cancel a queued/running simulation job' })
  cancel(@Param('id') id: string) { return this.svc.cancel(id); }
}
