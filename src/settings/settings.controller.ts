import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { BackupService } from './backup.service';
import { UpdateCloudflareConfigDto } from './dto/update-cloudflare-config.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  private readonly logger = new Logger(SettingsController.name);

  constructor(
    private readonly settingsService: SettingsService,
    private readonly backupService: BackupService,
  ) {}

  @Get('cloudflare-config')
  @ApiOperation({ summary: 'Get Cloudflare R2 backup configuration' })
  async getCloudflareConfig() {
    return this.settingsService.getCloudflareConfig();
  }

  @Post('cloudflare-config')
  @ApiOperation({ summary: 'Update Cloudflare R2 backup configuration' })
  async updateCloudflareConfig(@Body() dto: UpdateCloudflareConfigDto) {
    const config = await this.settingsService.updateCloudflareConfig(dto);
    // After updating config, reschedule the backup job
    await this.backupService.rescheduleBackup();
    return config;
  }

  @Post('test-backup')
  @ApiOperation({ summary: 'Manually trigger a database backup to Cloudflare R2' })
  async testBackup() {
    await this.backupService.runBackup();
    return { message: 'Manual backup triggered successfully' };
  }
}
