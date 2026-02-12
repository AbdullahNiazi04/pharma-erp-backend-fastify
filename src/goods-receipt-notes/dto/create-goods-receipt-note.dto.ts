import { IsString, IsDateString, IsIn, IsOptional, IsNumber, ValidateNested, IsArray, IsUUID, IsBoolean, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGoodsReceiptItemDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    itemCode?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    itemName?: string;

    @ApiProperty()
    @IsNumber()
    orderedQty: number;

    @ApiProperty()
    @IsNumber()
    receivedQty: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    rejectedQty?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    batchNumber?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    mfgDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    expiryDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    storageCondition?: string;
}

export class CreateGoodsReceiptNoteDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    grnNumber?: string;

    @ApiProperty()
    @IsDateString()
    grnDate: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    poId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    warehouseLocation?: string;

    @ApiProperty({ description: 'Name of person who received the goods (required for audit trail)' })
    @IsNotEmpty({ message: 'Received By is required for regulatory compliance' })
    @IsString()
    receivedBy: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    qcRequired?: boolean;

    @ApiPropertyOptional({ enum: ['Normal', 'Urgent', 'ASAP'] })
    @IsOptional()
    @IsIn(['Normal', 'Urgent', 'ASAP'])
    urgencyStatus?: 'Normal' | 'Urgent' | 'ASAP';

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    stockPosted?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    inventoryLocation?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    qcRemarks?: string;

    @ApiProperty({ type: [CreateGoodsReceiptItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateGoodsReceiptItemDto)
    items: CreateGoodsReceiptItemDto[];
}
