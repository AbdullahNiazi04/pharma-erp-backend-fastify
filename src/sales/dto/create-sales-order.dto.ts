import { IsString, IsDateString, IsOptional, IsNumber, ValidateNested, IsArray, IsUUID, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalesOrderItemDto {
    @ApiProperty({ description: 'Finished goods item ID' })
    @IsUUID()
    itemId: string;

    @ApiProperty()
    @IsNumber()
    quantity: number;

    @ApiProperty()
    @IsNumber()
    unitPrice: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    discount?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    tax?: number;

    @ApiProperty({ description: 'Net amount after discount and tax' })
    @IsNumber()
    netAmount: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    batchNumber?: string;
}

export class CreateSalesOrderDto {
    @ApiProperty()
    @IsDateString()
    orderDate: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    deliveryDate?: string;

    @ApiProperty()
    @IsUUID()
    customerId: string;

    @ApiPropertyOptional({ enum: ['Draft', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] })
    @IsOptional()
    @IsEnum(['Draft', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'])
    status?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    totalAmount?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    createdBy?: string;

    @ApiProperty({ type: [CreateSalesOrderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateSalesOrderItemDto)
    items: CreateSalesOrderItemDto[];
}
