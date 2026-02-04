import { IsString, IsOptional, IsInt, IsEnum, Min, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum QcReleaseStatus {
  Released = 'Released',
  Hold = 'Hold',
  Rejected = 'Rejected',
}

export class CreateFinishedGoodBatchDto {
  @ApiProperty({ example: 'uuid-of-item' })
  @IsUUID()
  itemId: string;

  @ApiProperty({ example: 'FG-BATCH-001' })
  @IsString()
  batchNumber: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  mfgDate: string;

  @ApiProperty({ example: '2025-12-31' })
  @IsDateString()
  expiryDate: string;

  @ApiProperty({ example: 5000 })
  @IsInt()
  @Min(0)
  quantityProduced: number;

  @ApiProperty({ example: 5000 })
  @IsInt()
  @Min(0)
  quantityAvailable: number;

  @ApiPropertyOptional({ enum: QcReleaseStatus, default: QcReleaseStatus.Hold })
  @IsOptional()
  @IsEnum(QcReleaseStatus)
  qcStatus?: QcReleaseStatus;

  @ApiPropertyOptional({ example: 'uuid-of-warehouse' })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;
}
