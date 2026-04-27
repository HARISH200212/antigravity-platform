import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HardwareService } from './hardware.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('hardware')
@Controller('api/v1/hardware')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class HardwareController {
  constructor(private readonly svc: HardwareService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get hardware bridge connectivity status' })
  getStatus() { return this.svc.getStatus(); }

  @Post('commands')
  @ApiOperation({ summary: 'Dispatch a hardware command to the coil array' })
  dispatch(@Body() body: any, @Request() req: any) {
    return this.svc.dispatchCommand(
      body.experimentId, body.commandType, body.payload, req.user.email
    );
  }

  @Post('emergency-stop')
  @ApiOperation({ summary: 'Issue an emergency stop — bypasses normal queue (direct hardware path)' })
  emergencyStop(@Body() body: { experimentId: string; reason: string }, @Request() req: any) {
    return this.svc.emergencyStop(body.experimentId, body.reason, req.user.email);
  }

  @Get('commands')
  @ApiOperation({ summary: 'Retrieve hardware command log' })
  getCommandLog(@Query('experimentId') experimentId?: string) {
    return this.svc.getCommandLog(experimentId);
  }
}
