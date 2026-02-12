import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto, CreatePurchaseOrderItemDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { tax_category } from '@prisma/client';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreatePurchaseOrderDto) {
    return await this.prisma.$transaction(async (tx) => {
      let itemsToUse: CreatePurchaseOrderItemDto[] = createDto.items || [];
      let poNumber = createDto.poNumber;

      // Auto-generate PO number if not provided
      if (!poNumber) {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const lastPo = await tx.purchase_orders.findFirst({
          orderBy: { created_at: 'desc' },
          select: { po_number: true },
        });

        let nextCount = 1;
        if (lastPo?.po_number) {
          const parts = lastPo.po_number.split('-');
          if (parts.length === 3) {
            const lastCount = parseInt(parts[2], 10);
            if (!isNaN(lastCount)) nextCount = lastCount + 1;
          }
        }
        poNumber = `PO-${dateStr}-${nextCount.toString().padStart(4, '0')}`;
      }

      // Auto-fill from PR if items are empty and PR ID is provided
      if (itemsToUse.length === 0 && createDto.referencePrId) {
        const prItems = await tx.purchase_requisition_items.findMany({
          where: { pr_id: createDto.referencePrId },
        });
        if (prItems.length > 0) {
          itemsToUse = prItems.map(prItem => ({
            itemCode: prItem.item_code || undefined,
            description: prItem.item_name || '',
            quantity: prItem.quantity,
            unitPrice: Number(prItem.estimated_unit_cost) || 0,
            discountPercent: 0,
            taxPercent: 0,
            isBatchRequired: false,
          }));
        }
      }

      // Calculate totals
      let subtotal = 0;
      let totalTaxAmount = 0;
      const isTaxInclusive = createDto.taxCategory === 'Inclusive';

      const itemsToInsert = itemsToUse.map(item => {
        const qty = item.quantity || 0;
        const price = item.unitPrice || 0;
        const discountPct = item.discountPercent || 0;
        const taxPct = item.taxPercent || 0;

        let netAmount: number, taxAmount: number, totalAmount: number;

        if (isTaxInclusive) {
          const grossTotal = qty * price;
          const discountedTotal = grossTotal * (1 - discountPct / 100);
          totalAmount = discountedTotal;
          netAmount = totalAmount / (1 + taxPct / 100);
          taxAmount = totalAmount - netAmount;
        } else {
          const grossAmount = qty * price;
          const discountAmount = grossAmount * (discountPct / 100);
          netAmount = grossAmount - discountAmount;
          taxAmount = netAmount * (taxPct / 100);
          totalAmount = netAmount + taxAmount;
        }

        subtotal += netAmount;
        totalTaxAmount += taxAmount;

        return {
          item_code: item.itemCode,
          description: item.description,
          quantity: qty,
          unit_price: price,
          discount_percent: discountPct,
          tax_percent: taxPct,
          net_amount: parseFloat(netAmount.toFixed(2)),
          total_amount: parseFloat(totalAmount.toFixed(2)),
          is_batch_required: item.isBatchRequired ?? false,
        };
      });

      const freight = createDto.freightCharges || 0;
      const insurance = createDto.insuranceCharges || 0;
      const finalTotal = subtotal + totalTaxAmount + freight + insurance;

      // Insert Header
      const newPo = await tx.purchase_orders.create({
        data: {
          po_number: poNumber,
          po_date: new Date(createDto.poDate),
          vendor_id: createDto.vendorId,
          reference_pr_id: createDto.referencePrId,
          currency: createDto.currency,
          payment_terms: createDto.paymentTerms,
          terms_and_conditions: createDto.termsAndConditions,
          incoterms: createDto.incoterms,
          delivery_schedule: createDto.deliverySchedule ? new Date(createDto.deliverySchedule) : null,
          delivery_location: createDto.deliveryLocation,
          tax_category: (createDto.taxCategory as tax_category) || 'Exclusive',
          freight_charges: freight,
          insurance_charges: insurance,
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax_amount: parseFloat(totalTaxAmount.toFixed(2)),
          total_amount: parseFloat(finalTotal.toFixed(2)),
          status: 'Draft',
        },
      });

      // Insert Items
      if (itemsToInsert.length > 0) {
        await tx.purchase_order_items.createMany({
          data: itemsToInsert.map(item => ({ ...item, po_id: newPo.id })),
        });
      }

      return { ...newPo, items: itemsToInsert };
    });
  }

  async findAll() {
    return this.prisma.purchase_orders.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get POs that are available for GRN creation
   * Returns POs with status Issued or Partial (not fully received)
   */
  async findAvailableForGRN() {
    return this.prisma.purchase_orders.findMany({
      where: {
        status: { in: ['Draft', 'Issued', 'Partial'] },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get completed/closed POs (historical view)
   */
  async findCompleted() {
    return this.prisma.purchase_orders.findMany({
      where: {
        status: { in: ['Closed', 'Cancelled'] },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const po = await this.prisma.purchase_orders.findUnique({
      where: { id },
      include: { purchase_order_items: true },
    });

    if (!po) throw new NotFoundException(`PO ${id} not found`);

    return { ...po, items: po.purchase_order_items };
  }

  async update(id: string, updateDto: UpdatePurchaseOrderDto) {
    await this.findOne(id);
    return this.prisma.purchase_orders.update({
      where: { id },
      data: {
        po_date: updateDto.poDate ? new Date(updateDto.poDate) : undefined,
        currency: updateDto.currency,
        payment_terms: updateDto.paymentTerms,
        terms_and_conditions: updateDto.termsAndConditions,
        incoterms: updateDto.incoterms,
        delivery_schedule: updateDto.deliverySchedule ? new Date(updateDto.deliverySchedule) : undefined,
        delivery_location: updateDto.deliveryLocation,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string) {
    const po = await this.findOne(id);

    await this.prisma.trash.create({
      data: { original_table: 'purchase_orders', original_id: id, data: po },
    });

    await this.prisma.purchase_order_items.deleteMany({ where: { po_id: id } });
    await this.prisma.purchase_orders.delete({ where: { id } });

    return { message: 'PO moved to trash', id };
  }

  async getVendorHistory(vendorId: string) {
    return this.prisma.purchase_orders.findMany({
      where: { vendor_id: vendorId },
      orderBy: { created_at: 'desc' },
      take: 5,
    });
  }
}
