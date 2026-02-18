import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { SettingsService } from './settings.service';
import { CronJob } from 'cron';

const execPromise = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    private configService: ConfigService,
    private settingsService: SettingsService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  // On application startup, load the schedule from DB
  async onModuleInit() {
    await this.rescheduleBackup();
  }

  async rescheduleBackup() {
    const config = await this.settingsService.getCloudflareConfig();
    const jobName = 'database-backup';

    // Remove existing job if any
    try {
      if (this.schedulerRegistry.doesExist('cron', jobName)) {
        this.schedulerRegistry.deleteCronJob(jobName);
      }
    } catch (e) {}

    if (config.backupSchedule) {
      const job = new CronJob(config.backupSchedule, () => {
        this.runBackup();
      });

      this.schedulerRegistry.addCronJob(jobName, job);
      job.start();
      this.logger.log(`Scheduled backup with expression: ${config.backupSchedule}`);
    }
  }

  async runBackup() {
    this.logger.log('Starting database backup process...');
    const config = await this.settingsService.getCloudflareConfig();

    if (!config.r2AccountId || !config.r2AccessKeyId || !config.r2SecretAccessKey || !config.r2BucketName) {
      this.logger.error('Cloudflare R2 credentials are not fully configured. Skipping backup.');
      return;
    }

    const dbUrl = this.configService.get<string>('DATABASE_URL');
    if (!dbUrl) {
      this.logger.error('DATABASE_URL not found in environment. Cannot perform backup.');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-${timestamp}.sql`;
    const tempPath = path.join(os.tmpdir(), fileName);

    try {
      // 1. Perform pg_dump
      this.logger.log(`Creating dump at ${tempPath}...`);
      // Use the connection string directly with pg_dump
      // We wrap the URL in quotes to handle special characters
      await execPromise(`pg_dump "${dbUrl}" > "${tempPath}"`);

      // 2. Upload to Cloudflare R2
      this.logger.log(`Uploading ${fileName} to R2 bucket ${config.r2BucketName}...`);
      const s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${config.r2AccountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: config.r2AccessKeyId,
          secretAccessKey: config.r2SecretAccessKey,
        },
      });

      const fileContent = fs.readFileSync(tempPath);
      await s3Client.send(
        new PutObjectCommand({
          Bucket: config.r2BucketName,
          Key: `backups/${fileName}`,
          Body: fileContent,
        }),
      );

      this.logger.log('Backup uploaded successfully.');
    } catch (error) {
      this.logger.error(`Backup failed: ${error.message}`);
      throw error;
    } finally {
      // 3. Delete temporary file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
        this.logger.log('Temporary local backup file deleted.');
      }
    }
  }
}
