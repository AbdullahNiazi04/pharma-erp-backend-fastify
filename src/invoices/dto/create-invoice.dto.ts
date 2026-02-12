import { IsString, IsDateString, IsOptional, IsNumber, IsUUID, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInvoiceDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    invoiceNumber?: string;

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

    @ApiPropertyOptional({ enum: ['Pending', 'Paid', 'Overdue', 'Cancelled'] })
    @IsOptional()
    @IsIn(['Pending', 'Paid', 'Overdue', 'Cancelled'])
    status?: 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';

    @ApiPropertyOptional({ default: 'PKR', description: 'Currency code (e.g., PKR, USD)' })
    @IsOptional()
    @IsString()
    currency?: string;
}
