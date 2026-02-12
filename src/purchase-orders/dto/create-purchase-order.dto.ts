import { IsString, IsDateString, IsIn, IsOptional, IsNumber, ValidateNested, IsArray, IsUUID, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePurchaseOrderItemDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    itemCode?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    category?: string;

    @ApiProperty()
    @IsNumber()
    quantity: number;

    @ApiProperty()
    @IsNumber()
    unitPrice: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    discountPercent?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    taxPercent?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isBatchRequired?: boolean;
}

export class CreatePurchaseOrderDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    poNumber?: string;

    @ApiProperty()
    @IsDateString()
    poDate: string;

    @ApiProperty()
    @IsUUID()
    vendorId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    referencePrId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    currency?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    paymentTerms?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    termsAndConditions?: string;

    @ApiPropertyOptional({ enum: ['Inclusive', 'Exclusive'] })
    @IsOptional()
    @IsIn(['Inclusive', 'Exclusive'])
    taxCategory?: 'Inclusive' | 'Exclusive';

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    incoterms?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    deliverySchedule?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    deliveryLocation?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    freightCharges?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    insuranceCharges?: number;

    @ApiProperty({ type: [CreatePurchaseOrderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePurchaseOrderItemDto)
    items: CreatePurchaseOrderItemDto[];
}
