import { IsString, IsOptional, IsInt, IsEnum, Min, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BatchStatus {
  Quarantine = 'Quarantine',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export class CreateRawMaterialBatchDto {
  @ApiProperty({ example: 'uuid-of-inventory' })
  @IsUUID()
  inventoryId: string;

  @ApiProperty({ example: 'BATCH-001' })
  @IsString()
  batchNumber: string;

  @ApiProperty({ example: 1000 })
  @IsInt()
  @Min(0)
  quantityAvailable: number;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ enum: BatchStatus, default: BatchStatus.Quarantine })
  @IsOptional()
  @IsEnum(BatchStatus)
  qcStatus?: BatchStatus;

  @ApiPropertyOptional({ example: 'Section A, Shelf 1' })
  @IsOptional()
  @IsString()
  warehouseLocation?: string;
}
