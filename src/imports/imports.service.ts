import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateImportOrderDto } from './dto/create-import-order.dto';
import { UpdateImportOrderDto } from './dto/update-import-order.dto';

@Injectable()
export class ImportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateImportOrderDto) {
// ... (omitted for brevity, no change)
  }

  // ... (omitted)


  async findAll() {
    return this.prisma.import_orders.findMany({
      include: {
        vendors: true,
        purchase_orders: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.import_orders.findUnique({
      where: { id },
      include: {
        vendors: true,
        purchase_orders: true,
        import_documents: true,
      },
    });
  }

  async update(id: string, data: UpdateImportOrderDto) {
    const updateData: any = {
      ...data,
      // ... (re-map fields if needed, or just use cleanData later)
      import_number: data.importNumber,
      vendor_id: data.vendorId,
      reference_po_id: data.referencePoId,
      currency: data.currency,
      exchange_rate: data.exchangeRate,
      amount_usd: data.amountUsd,
      bill_of_lading: data.billOfLading,
      lc_number: data.lcNumber,
      customs_ref: data.customsRef,
      port_of_entry: data.portOfEntry,
      status: data.status,
      eta: data.eta ? new Date(data.eta) : undefined,
      arrival_date: data.arrivalDate ? new Date(data.arrivalDate) : undefined,
      clearance_date: data.clearanceDate ? new Date(data.clearanceDate) : undefined,
    };

    // Recalculate PKR amount if USD amount or rate changes
    if (data.amountUsd !== undefined || data.exchangeRate !== undefined) {
      if (data.amountUsd !== undefined && data.exchangeRate !== undefined) {
         updateData.amount_pkr = data.amountUsd * data.exchangeRate;
      } else {
         const current = await this.prisma.import_orders.findUnique({ where: { id } });
         if (!current) {
            throw new NotFoundException(`Import order with ID ${id} not found`);
         }
         const usd = data.amountUsd !== undefined ? data.amountUsd : Number(current.amount_usd);
         const rate = data.exchangeRate !== undefined ? data.exchangeRate : Number(current.exchange_rate);
         updateData.amount_pkr = usd * rate;
      }
    }


    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    // Remove camelCase keys that were mapped to snake_case manually above?
    // Actually, spreading data (...) puts camelCase keys in updateData. 
    // Prisma will complain about unknown fields.
    // So we should construct updateData cleanly.
    
    const cleanData: any = {
        import_number: data.importNumber,
        vendor_id: data.vendorId,
        reference_po_id: data.referencePoId,
        currency: data.currency,
        exchange_rate: data.exchangeRate,
        amount_usd: data.amountUsd,
        amount_pkr: updateData.amount_pkr,
        bill_of_lading: data.billOfLading,
        lc_number: data.lcNumber,
        customs_ref: data.customsRef,
        port_of_entry: data.portOfEntry,
        status: data.status,
        eta: data.eta ? new Date(data.eta) : undefined,
        arrival_date: data.arrivalDate ? new Date(data.arrivalDate) : undefined,
        clearance_date: data.clearanceDate ? new Date(data.clearanceDate) : undefined,
    };
    
    // allow nulls for dates if explicitly passed? 
    // The DTO makes them optional strings. If user passes null, we might want to set null.
    // Typescript might complain.
    
    Object.keys(cleanData).forEach(key => cleanData[key] === undefined && delete cleanData[key]);

    return this.prisma.import_orders.update({
      where: { id },
      data: cleanData,
    });
  }

  async remove(id: string) {
    return this.prisma.import_orders.delete({
      where: { id },
    });
  }
}
