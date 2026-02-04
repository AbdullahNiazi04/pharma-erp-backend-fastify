import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { vendor_status, audit_status } from '@prisma/client';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async create(createVendorDto: CreateVendorDto) {
    return this.prisma.vendors.create({
      data: {
        legal_name: createVendorDto.legalName,
        vendor_type: createVendorDto.vendorType,
        business_category: createVendorDto.businessCategory,
        registration_number: createVendorDto.registrationNumber,
        ntn_vat_gst: createVendorDto.ntnVatGst,
        country: createVendorDto.country,
        city: createVendorDto.city,
        address: createVendorDto.address,
        status: createVendorDto.status as vendor_status,
        contact_person: createVendorDto.contactPerson,
        contact_number: createVendorDto.contactNumber,
        email: createVendorDto.email,
        website: createVendorDto.website,
        is_gmp_certified: createVendorDto.isGmpCertified,
        is_blacklisted: createVendorDto.isBlacklisted,
        regulatory_license: createVendorDto.regulatoryLicense,
        license_expiry_date: createVendorDto.licenseExpiryDate 
          ? new Date(createVendorDto.licenseExpiryDate) 
          : null,
        quality_rating: createVendorDto.qualityRating,
        audit_status: createVendorDto.auditStatus as audit_status,
        risk_category: createVendorDto.riskCategory,
        bank_name: createVendorDto.bankName,
        account_title: createVendorDto.accountTitle,
        account_number: createVendorDto.accountNumber,
        currency: createVendorDto.currency,
        payment_terms: createVendorDto.paymentTerms,
        credit_limit: createVendorDto.creditLimit,
        tax_withholding_percent: createVendorDto.taxWithholdingPercent,
      },
    });
  }

  async findAll() {
    return this.prisma.vendors.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const vendor = await this.prisma.vendors.findUnique({
      where: { id },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    return vendor;
  }

  async update(id: string, updateVendorDto: UpdateVendorDto) {
    // Check if vendor exists
    await this.findOne(id);

    return this.prisma.vendors.update({
      where: { id },
      data: {
        legal_name: updateVendorDto.legalName,
        vendor_type: updateVendorDto.vendorType,
        business_category: updateVendorDto.businessCategory,
        registration_number: updateVendorDto.registrationNumber,
        ntn_vat_gst: updateVendorDto.ntnVatGst,
        country: updateVendorDto.country,
        city: updateVendorDto.city,
        address: updateVendorDto.address,
        status: updateVendorDto.status as vendor_status,
        contact_person: updateVendorDto.contactPerson,
        contact_number: updateVendorDto.contactNumber,
        email: updateVendorDto.email,
        website: updateVendorDto.website,
        is_gmp_certified: updateVendorDto.isGmpCertified,
        is_blacklisted: updateVendorDto.isBlacklisted,
        regulatory_license: updateVendorDto.regulatoryLicense,
        license_expiry_date: updateVendorDto.licenseExpiryDate 
          ? new Date(updateVendorDto.licenseExpiryDate) 
          : undefined,
        quality_rating: updateVendorDto.qualityRating,
        audit_status: updateVendorDto.auditStatus as audit_status,
        risk_category: updateVendorDto.riskCategory,
        bank_name: updateVendorDto.bankName,
        account_title: updateVendorDto.accountTitle,
        account_number: updateVendorDto.accountNumber,
        currency: updateVendorDto.currency,
        payment_terms: updateVendorDto.paymentTerms,
        credit_limit: updateVendorDto.creditLimit,
        tax_withholding_percent: updateVendorDto.taxWithholdingPercent,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string) {
    // Get the vendor first
    const vendor = await this.findOne(id);

    // Move to Trash (soft delete)
    await this.prisma.trash.create({
      data: {
        original_table: 'vendors',
        original_id: id,
        data: vendor,
      },
    });

    // Delete from original table
    await this.prisma.vendors.delete({
      where: { id },
    });

    return { message: 'Vendor moved to trash successfully', deletedId: id };
  }
}
