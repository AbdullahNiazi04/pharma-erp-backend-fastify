import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { invoice_status } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateInvoiceDto) {
    return this.prisma.invoices.create({
      data: {
        invoice_number: createDto.invoiceNumber,
        invoice_date: new Date(createDto.invoiceDate),
        due_date: new Date(createDto.dueDate),
        vendor_id: createDto.vendorId,
        po_id: createDto.poId,
        grn_id: createDto.grnId,
        amount: createDto.amount,
        status: (createDto.status as invoice_status) || 'Pending',
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
      include: { vendors: true, payments: true, purchase_orders: true },
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
