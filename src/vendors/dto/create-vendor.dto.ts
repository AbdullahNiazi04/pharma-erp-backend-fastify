import { IsString, IsOptional, IsEmail, IsUrl, IsBoolean, IsDateString, IsNumber, Min, Max, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVendorDto {
    @ApiProperty({ description: 'Legal name of the vendor/company' })
    @IsString()
    legalName: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    vendorType?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    businessCategory?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    registrationNumber?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    ntnVatGst?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    country?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ enum: ['Active', 'Inactive', 'Blacklisted'] })
    @IsOptional()
    @IsEnum(['Active', 'Inactive', 'Blacklisted'])
    status?: 'Active' | 'Inactive' | 'Blacklisted';

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    contactPerson?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    contactNumber?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl()
    website?: string;

    // Compliance
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isGmpCertified?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isBlacklisted?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    regulatoryLicense?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    licenseExpiryDate?: string;

    @ApiPropertyOptional({ minimum: 1, maximum: 5 })
    @IsOptional()
    @IsNumber()
    qualityRating?: number;

    @ApiPropertyOptional({ enum: ['Pending', 'Cleared', 'Failed'] })
    @IsOptional()
    @IsEnum(['Pending', 'Cleared', 'Failed'])
    auditStatus?: 'Pending' | 'Cleared' | 'Failed';

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    riskCategory?: string;

    // Financial
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bankName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    accountTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    accountNumber?: string;

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
    @IsNumber()
    creditLimit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    taxWithholdingPercent?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    vendorTags?: string[]; // Vendor tags
}
