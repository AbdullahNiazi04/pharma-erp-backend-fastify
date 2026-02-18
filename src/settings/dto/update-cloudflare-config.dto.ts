import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCloudflareConfigDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  r2AccountId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  r2AccessKeyId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  r2SecretAccessKey?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  r2BucketName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  backupSchedule?: string;
}
