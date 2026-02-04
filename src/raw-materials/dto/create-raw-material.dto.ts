import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRawMaterialDto {
    @ApiProperty({ description: 'Material code (unique)' })
    @IsString()
    code: string;

    @ApiProperty({ description: 'Material name (unique)' })
    @IsString()
    name: string;

    @ApiProperty({ enum: ['API', 'Excipient', 'Packaging'] })
    @IsEnum(['API', 'Excipient', 'Packaging'])
    type: 'API' | 'Excipient' | 'Packaging';

    @ApiProperty({ description: 'Unit of measure (e.g., kg, L, pcs)' })
    @IsString()
    unitOfMeasure: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;
}
