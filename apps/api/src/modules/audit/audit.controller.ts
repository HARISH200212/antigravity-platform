import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('audit')
@Controller('api/v1/audit')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class AuditController {
  constructor(private readonly svc: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List audit log entries (most recent first)' })
  findAll(
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('resource') resource?: string,
    @Query('limit') limit?: number,
  ) {
    return this.svc.findAll({ action, userId, resource, limit: limit ? +limit : 100 });
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify SHA-256 hash chain integrity — tamper detection' })
  verify() { return this.svc.verifyIntegrity(); }

  @Post()
  @ApiOperation({ summary: 'Write an audit entry (internal use — prefer service injection)' })
  log(@Body() dto: any) { return this.svc.log(dto); }
}
