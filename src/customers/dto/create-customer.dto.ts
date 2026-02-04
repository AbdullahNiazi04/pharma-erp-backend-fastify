import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ enum: ['Distributor', 'Hospital', 'Pharmacy'] })
    @IsEnum(['Distributor', 'Hospital', 'Pharmacy'])
    type: 'Distributor' | 'Hospital' | 'Pharmacy';

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    contactPerson?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    billingAddress?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    shippingAddress?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    taxId?: string;
}
