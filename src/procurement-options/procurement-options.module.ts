import { Module } from '@nestjs/common';
import { ProcurementOptionsService } from './procurement-options.service';
import { ProcurementOptionsController } from './procurement-options.controller';

@Module({
  controllers: [ProcurementOptionsController],
  providers: [ProcurementOptionsService],
  exports: [ProcurementOptionsService],
})
export class ProcurementOptionsModule {}
