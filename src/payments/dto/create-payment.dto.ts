import { IsString, IsDateString, IsNumber, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty()
  @IsUUID()
  invoiceId: string;

  @ApiProperty()
  @IsDateString()
  paymentDate: string;

  @ApiPropertyOptional({ enum: ['Bank_Transfer', 'Cheque', 'Cash', 'Credit_Card'] })
  @IsOptional()
  @IsEnum(['Bank_Transfer', 'Cheque', 'Cash', 'Credit_Card'])
  paymentMethod?: 'Bank_Transfer' | 'Cheque' | 'Cash' | 'Credit_Card';

  @ApiProperty()
  @IsNumber()
  amountPaid: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  taxWithheld?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  advanceAdjustments?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentReference?: string;

  @ApiPropertyOptional({ enum: ['Pending', 'Completed', 'Failed'] })
  @IsOptional()
  @IsEnum(['Pending', 'Completed', 'Failed'])
  status?: 'Pending' | 'Completed' | 'Failed';
}
