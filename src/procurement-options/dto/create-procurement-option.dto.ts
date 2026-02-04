import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProcurementOptionDto {
    @ApiProperty({ description: 'Option type (e.g., vendor_type, payment_terms)' })
    @IsString()
    type: string;

    @ApiProperty({ description: 'Display label' })
    @IsString()
    label: string;

    @ApiProperty({ description: 'Value to store' })
    @IsString()
    value: string;

    @ApiPropertyOptional({ description: 'Is a system option (not deletable)' })
    @IsOptional()
    @IsBoolean()
    isSystem?: boolean;
}
