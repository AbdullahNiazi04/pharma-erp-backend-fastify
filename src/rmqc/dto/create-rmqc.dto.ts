import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRmqcDto {
  @ApiProperty({ description: 'GRN ID' })
  @IsUUID()
  @IsNotEmpty()
  grn_id: string;

  @ApiPropertyOptional({ description: 'Raw Material Batch ID' })
  @IsUUID()
  @IsOptional()
  raw_material_id?: string;

  @ApiProperty({ description: 'Inspector Name' })
  @IsString()
  @IsNotEmpty()
  inspector_name: string;

  @ApiPropertyOptional({ description: 'Description/Observations' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Images URLs' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ description: 'Documents URLs' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  documents?: string[];
}
