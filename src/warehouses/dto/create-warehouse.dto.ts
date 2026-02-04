import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWarehouseDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiPropertyOptional({ enum: ['Normal', 'Cold Chain'] })
    @IsOptional()
    @IsEnum(['Normal', 'Cold Chain'])
    type?: 'Normal' | 'Cold Chain';

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    location?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    temperatureRange?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    humidityRange?: string;

    @ApiPropertyOptional({ enum: ['Active', 'Inactive'] })
    @IsOptional()
    @IsEnum(['Active', 'Inactive'])
    status?: 'Active' | 'Inactive';
}
