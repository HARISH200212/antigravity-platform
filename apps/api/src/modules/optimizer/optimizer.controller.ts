import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OptimizerService } from './optimizer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('optimizer')
@Controller('api/v1/optimizer')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class OptimizerController {
  constructor(private readonly svc: OptimizerService) {}

  @Get('model')
  @ApiOperation({ summary: 'Get PPO agent model information' })
  getModel() { return this.svc.getModelInfo(); }

  @Get('results')
  @ApiOperation({ summary: 'List optimization results' })
  list(@Query('experimentId') experimentId?: string) { return this.svc.listResults(experimentId); }

  @Post('optimize')
  @ApiOperation({ summary: 'Request a new PPO optimization run for an experiment' })
  optimize(@Body() body: { experimentId: string; currentConfig: any }) {
    return this.svc.requestOptimization(body.experimentId, body.currentConfig);
  }

  @Patch('results/:id/apply')
  @ApiOperation({ summary: 'Approve and apply an optimization suggestion' })
  apply(@Param('id') id: string, @Request() req: any) {
    return this.svc.approveAndApply(id, req.user.email);
  }

  @Patch('results/:id/reject')
  @ApiOperation({ summary: 'Reject an optimization suggestion' })
  reject(@Param('id') id: string) { return this.svc.reject(id); }
}
