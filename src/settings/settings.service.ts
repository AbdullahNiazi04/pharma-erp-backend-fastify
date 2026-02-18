import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCloudflareConfigDto } from './dto/update-cloudflare-config.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private prisma: PrismaService) {}

  async getCloudflareConfig() {
    let config = await this.prisma.cloudflareconfig.findFirst();
    if (!config) {
      config = await this.prisma.cloudflareconfig.create({
        data: {
          backupSchedule: '0 0 * * *',
        },
      });
    }
    return config;
  }

  async updateCloudflareConfig(dto: UpdateCloudflareConfigDto) {
    const config = await this.getCloudflareConfig();
    return this.prisma.cloudflareconfig.update({
      where: { id: config.id },
      data: dto,
    });
  }
}
