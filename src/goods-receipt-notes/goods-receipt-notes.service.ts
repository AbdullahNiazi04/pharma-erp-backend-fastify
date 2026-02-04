import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoodsReceiptNoteDto } from './dto/create-goods-receipt-note.dto';
import { UpdateGoodsReceiptNoteDto } from './dto/update-goods-receipt-note.dto';
import { qc_urgency } from '@prisma/client';

@Injectable()
export class GoodsReceiptNotesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateGoodsReceiptNoteDto) {
    return await this.prisma.$transaction(async (tx) => {
      // Insert Header
      const grn = await tx.goods_receipt_notes.create({
        data: {
          grn_number: createDto.grnNumber,
          grn_date: new Date(createDto.grnDate),
          po_id: createDto.poId,
          warehouse_location: createDto.warehouseLocation,
          received_by: createDto.receivedBy,
          qc_required: createDto.qcRequired,
          urgency_status: createDto.urgencyStatus as qc_urgency,
          qc_remarks: createDto.qcRemarks,
          status: 'Draft',
        },
      });

      // Insert Items
      if (createDto.items && createDto.items.length > 0) {
        await tx.goods_receipt_items.createMany({
          data: createDto.items.map(item => ({
            grn_id: grn.id,
            item_code: item.itemCode,
            item_name: item.itemName,
            ordered_qty: item.orderedQty,
            received_qty: item.receivedQty,
            rejected_qty: item.rejectedQty || 0,
            batch_number: item.batchNumber,
            mfg_date: item.mfgDate ? new Date(item.mfgDate) : null,
            expiry_date: item.expiryDate ? new Date(item.expiryDate) : null,
            storage_condition: item.storageCondition,
          })),
        });
      }

      const items = await tx.goods_receipt_items.findMany({ where: { grn_id: grn.id } });
      return { ...grn, items };
    });
  }

  async findAll() {
    return this.prisma.goods_receipt_notes.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const grn = await this.prisma.goods_receipt_notes.findUnique({
      where: { id },
      include: { goods_receipt_items: true },
    });

    if (!grn) throw new NotFoundException(`GRN ${id} not found`);
    return { ...grn, items: grn.goods_receipt_items };
  }

  async update(id: string, updateDto: UpdateGoodsReceiptNoteDto) {
    await this.findOne(id);
    return this.prisma.goods_receipt_notes.update({
      where: { id },
      data: {
        grn_date: updateDto.grnDate ? new Date(updateDto.grnDate) : undefined,
        warehouse_location: updateDto.warehouseLocation,
        received_by: updateDto.receivedBy,
        qc_required: updateDto.qcRequired,
        urgency_status: updateDto.urgencyStatus as qc_urgency,
        qc_remarks: updateDto.qcRemarks,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string) {
    const grn = await this.findOne(id);

    await this.prisma.trash.create({
      data: { original_table: 'goods_receipt_notes', original_id: id, data: grn },
    });

    await this.prisma.goods_receipt_items.deleteMany({ where: { grn_id: id } });
    await this.prisma.goods_receipt_notes.delete({ where: { id } });

    return { message: 'GRN moved to trash', id };
  }
}
