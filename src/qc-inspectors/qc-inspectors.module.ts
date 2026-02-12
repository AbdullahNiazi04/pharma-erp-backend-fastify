import { Module } from '@nestjs/common';
import { QcInspectorsService } from './qc-inspectors.service';
import { QcInspectorsController } from './qc-inspectors.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [QcInspectorsController],
  providers: [QcInspectorsService, PrismaService],
})
export class QcInspectorsModule {}
