import { Module } from '@nestjs/common';
import { RmqcService } from './rmqc.service';
import { RmqcController } from './rmqc.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RmqcController],
  providers: [RmqcService],
})
export class RmqcModule {}
