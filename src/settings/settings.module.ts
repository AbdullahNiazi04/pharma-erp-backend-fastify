import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { BackupService } from './backup.service';
import { SettingsController } from './settings.controller';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [SettingsController],
  providers: [SettingsService, BackupService],
  exports: [SettingsService, BackupService],
})
export class SettingsModule {}
