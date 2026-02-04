import { IsString, IsDateString, IsEnum, IsOptional, IsNumber, ValidateNested, IsArray, IsUUID, IsBoolean } from 'class-validator';
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
    @ApiProperty()
    @IsString()
    grnNumber: string;

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

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    receivedBy?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    qcRequired?: boolean;

    @ApiPropertyOptional({ enum: ['Normal', 'Urgent', 'ASAP'] })
    @IsOptional()
    @IsEnum(['Normal', 'Urgent', 'ASAP'])
    urgencyStatus?: 'Normal' | 'Urgent' | 'ASAP';

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
