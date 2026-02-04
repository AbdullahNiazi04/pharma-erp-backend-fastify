import { IsString, IsDateString, IsEnum, IsOptional, IsNumber, ValidateNested, IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePurchaseRequisitionItemDto {
    @ApiProperty()
    @IsString()
    itemName: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    itemCode?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    uom?: string;

    @ApiProperty()
    @IsNumber()
    quantity: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    estimatedUnitCost?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    preferredVendorId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    specification?: string;
}

export class CreatePurchaseRequisitionDto {
    @ApiProperty()
    @IsString()
    reqNumber: string;

    @ApiProperty()
    @IsDateString()
    requisitionDate: string;

    @ApiProperty()
    @IsString()
    requestedBy: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    department?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    costCenter?: string;

    @ApiPropertyOptional({ enum: ['Normal', 'Urgent'] })
    @IsOptional()
    @IsEnum(['Normal', 'Urgent'])
    priority?: 'Normal' | 'Urgent';

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    expectedDeliveryDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    budgetReference?: string;

    @ApiProperty({ type: [CreatePurchaseRequisitionItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePurchaseRequisitionItemDto)
    items: CreatePurchaseRequisitionItemDto[];
}
