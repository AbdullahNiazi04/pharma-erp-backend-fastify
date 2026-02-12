import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { invoice_status } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateInvoiceDto) {
    let vendorId = createDto.vendorId;
    let poId = createDto.poId;

    // P-11: Auto-link from GRN
    if (createDto.grnId) {
      const grn = await this.prisma.goods_receipt_notes.findUnique({
        where: { id: createDto.grnId },
        include: { purchase_orders: true },
      });

      if (!grn) {
        throw new NotFoundException(`GRN ${createDto.grnId} not found`);
      }

      if (!grn.purchase_orders) {
        throw new BadRequestException(`GRN ${createDto.grnId} is not linked to a Purchase Order`);
      }

      // P-12: Invoice Date Validation
      const invoiceDate = new Date(createDto.invoiceDate);
      const grnDate = new Date(grn.grn_date);
      // Strip time if needed, but assuming simple comparison works as dates are usually significant part
      if (invoiceDate < grnDate) {
         throw new BadRequestException(`Invoice date cannot be before GRN date (${grnDate.toDateString()})`);
      }

      // P-12: QC Validation
      if (grn.qc_required && grn.qc_status !== 'Passed') {
         throw new BadRequestException('Invoice can only be created after QC approval (Status: ' + grn.qc_status + ')');
      }

      // Enforce links based on GRN
      poId = grn.po_id || undefined;
      vendorId = grn.purchase_orders.vendor_id;
    }

    // Auto-generate invoice number if not provided
    let invoiceNumber = createDto.invoiceNumber;
    if (!invoiceNumber) {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const lastInv = await this.prisma.invoices.findFirst({
        orderBy: { created_at: 'desc' },
        select: { invoice_number: true },
      });
      let nextCount = 1;
      if (lastInv?.invoice_number) {
        const parts = lastInv.invoice_number.split('-');
        if (parts.length === 3) {
          const lastCount = parseInt(parts[2], 10);
          if (!isNaN(lastCount)) nextCount = lastCount + 1;
        }
      }
      invoiceNumber = `INV-${dateStr}-${nextCount.toString().padStart(4, '0')}`;
    }

    return this.prisma.invoices.create({
      data: {
        invoice_number: invoiceNumber,
        invoice_date: new Date(createDto.invoiceDate),
        due_date: new Date(createDto.dueDate),
        vendor_id: vendorId,
        po_id: poId || undefined,
        grn_id: createDto.grnId,
        amount: createDto.amount,
        status: (createDto.status as invoice_status) || 'Pending',
        currency: createDto.currency || 'PKR',
      },
    });
  }

  async findAll() {
    return this.prisma.invoices.findMany({
      orderBy: { created_at: 'desc' },
      include: { vendors: true },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoices.findUnique({
      where: { id },
      include: {
        vendors: true,
        payments: true,
        purchase_orders: {
          include: { purchase_order_items: true }
        },
        goods_receipt_notes: {
          include: { goods_receipt_items: true }
        }
      },
    });
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return invoice;
  }

  async update(id: string, updateDto: UpdateInvoiceDto) {
    await this.findOne(id);
    return this.prisma.invoices.update({
      where: { id },
      data: {
        invoice_date: updateDto.invoiceDate ? new Date(updateDto.invoiceDate) : undefined,
        due_date: updateDto.dueDate ? new Date(updateDto.dueDate) : undefined,
        amount: updateDto.amount,
        status: updateDto.status as invoice_status,
        updated_at: new Date(),
        currency: updateDto.currency,
      },
    });
  }

  async remove(id: string) {
    const invoice = await this.findOne(id);
    await this.prisma.trash.create({
      data: { original_table: 'invoices', original_id: id, data: invoice },
    });
    await this.prisma.invoices.delete({ where: { id } });
    return { message: 'Invoice moved to trash', id };
  }
}
