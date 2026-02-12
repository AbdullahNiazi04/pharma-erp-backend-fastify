import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { import_status } from '@prisma/client';

export class CreateImportOrderDto {
  @ApiProperty({ example: 'IMP-2023-001' })
  @IsString()
  @IsNotEmpty()
  importNumber: string;

  @ApiProperty({ example: 'uuid-for-vendor' })
  @IsUUID()
  @IsNotEmpty()
  vendorId: string;

  @ApiPropertyOptional({ example: 'uuid-for-po' })
  @IsUUID()
  @IsOptional()
  referencePoId?: string;

  @ApiPropertyOptional({ default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: 280.5, description: 'Exchange rate (PKR per USD)' })
  @IsNumber()
  @IsNotEmpty()
  exchangeRate: number;

  @ApiProperty({ example: 5000, description: 'Amount in USD' })
  @IsNumber()
  @IsNotEmpty()
  amountUsd: number;

  @ApiPropertyOptional({ example: 'BL-123456' })
  @IsString()
  @IsOptional()
  billOfLading?: string;

  @ApiPropertyOptional({ example: 'LC-789012' })
  @IsString()
  @IsOptional()
  lcNumber?: string;

  @ApiPropertyOptional({ example: 'CUST-345678' })
  @IsString()
  @IsOptional()
  customsRef?: string;

  @ApiPropertyOptional({ example: 'Karachi Port' })
  @IsString()
  @IsOptional()
  portOfEntry?: string;

  @ApiPropertyOptional({ enum: import_status, default: import_status.Pending })
  @IsEnum(import_status)
  @IsOptional()
  status?: import_status;

  @ApiPropertyOptional({ example: '2023-12-31' })
  @IsDateString()
  @IsOptional()
  eta?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  arrivalDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  clearanceDate?: string;
}
