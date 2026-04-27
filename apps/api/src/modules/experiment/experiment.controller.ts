import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request, HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ExperimentService } from './experiment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { ExperimentStatus, CoilConfig, SafetyThresholds } from '../../types/domain.types';

@ApiTags('experiments')
@Controller('api/v1/experiments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class ExperimentController {
  constructor(private readonly svc: ExperimentService) {}

  @Get()
  @ApiOperation({ summary: 'List all experiments for the authenticated tenant' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT','CONFIGURED','RUNNING','PAUSED','COMPLETED','ARCHIVED'] })
  findAll(@Request() req: any, @Query('status') status?: ExperimentStatus) {
    return this.svc.findAll(req.user.tenantId, status);
  }

  @Get('running')
  @ApiOperation({ summary: 'Get all currently running experiments' })
  getRunning(@Request() req: any) {
    return this.svc.getRunning(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get experiment by ID' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.svc.findOne(id, req.user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new experiment in DRAFT state' })
  @ApiResponse({ status: 201, description: 'Experiment created' })
  create(@Body() body: any, @Request() req: any) {
    return this.svc.create({ ...body, tenantId: req.user.tenantId, researcher: req.user.email });
  }

  @Patch(':id/transition')
  @ApiOperation({ summary: 'Transition experiment to a new state' })
  transition(
    @Param('id') id: string,
    @Body() body: { status: ExperimentStatus },
    @Request() req: any,
  ) {
    return this.svc.transition(id, req.user.tenantId, body.status, req.user.email);
  }

  @Patch(':id/coil-config')
  @ApiOperation({ summary: 'Update coil configuration for an experiment' })
  updateCoilConfig(
    @Param('id') id: string,
    @Body() config: Partial<CoilConfig>,
    @Request() req: any,
  ) {
    return this.svc.updateCoilConfig(id, req.user.tenantId, config);
  }

  @Patch(':id/safety-thresholds')
  @ApiOperation({ summary: 'Update safety thresholds for an experiment' })
  updateThresholds(
    @Param('id') id: string,
    @Body() thresholds: Partial<SafetyThresholds>,
    @Request() req: any,
  ) {
    return this.svc.updateSafetyThresholds(id, req.user.tenantId, thresholds);
  }
}
