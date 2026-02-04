import { IsString, IsOptional, IsInt, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RmStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}

export class CreateRawMaterialInventoryDto {
  @ApiProperty({ example: 'uuid-of-material' })
  @IsString()
  materialId: string;

  @ApiPropertyOptional({ example: 'Room Temperature' })
  @IsOptional()
  @IsString()
  storageCondition?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  reorderLevel?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  safetyStock?: number;

  @ApiPropertyOptional({ enum: RmStatus, default: RmStatus.Active })
  @IsOptional()
  @IsEnum(RmStatus)
  status?: RmStatus;
}
