import { IsString, IsDateString, IsOptional, IsNumber, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInvoiceDto {
    @ApiProperty()
    @IsString()
    invoiceNumber: string;

    @ApiProperty()
    @IsDateString()
    invoiceDate: string;

    @ApiProperty()
    @IsDateString()
    dueDate: string;

    @ApiProperty()
    @IsUUID()
    vendorId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    poId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    grnId?: string;

    @ApiProperty()
    @IsNumber()
    amount: number;

    @ApiPropertyOptional({ enum: ['Pending', 'Approved', 'Paid', 'Cancelled'] })
    @IsOptional()
    @IsEnum(['Pending', 'Approved', 'Paid', 'Cancelled'])
    status?: 'Pending' | 'Approved' | 'Paid' | 'Cancelled';
}
