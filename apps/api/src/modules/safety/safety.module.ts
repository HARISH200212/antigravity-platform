import { Module } from '@nestjs/common';
import { SafetyController } from './safety.controller';
import { SafetyService } from './safety.service';
import { HardwareModule } from '../hardware/hardware.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [HardwareModule, AuditModule],
  controllers: [SafetyController],
  providers: [SafetyService],
  exports: [SafetyService],
})
export class SafetyModule {}
