import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFinishedGoodDto } from './dto/create-finished-good.dto';
import { UpdateFinishedGoodDto } from './dto/update-finished-good.dto';
import { fg_status, qc_release_status } from '@prisma/client';
import { CreateFinishedGoodBatchDto } from './dto/create-finished-good-batch.dto';
import { UpdateFinishedGoodBatchDto } from './dto/update-finished-good-batch.dto';

@Injectable()
export class FinishedGoodsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateFinishedGoodDto) {
    return this.prisma.finished_goods_items.create({
      data: {
        item_code: createDto.itemCode,
        item_name: createDto.itemName,
        dosage_form: createDto.dosageForm,
        strength: createDto.strength,
        pack_size: createDto.packSize,
        shelf_life: createDto.shelfLife,
        mrp: createDto.mrp,
        status: createDto.status as fg_status || 'Active',
      },
    });
  }

  async findAll() {
    return this.prisma.finished_goods_items.findMany({ orderBy: { created_at: 'desc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.finished_goods_items.findUnique({
      where: { id },
      include: { finished_goods_batches: true },
    });
    if (!item) throw new NotFoundException(`Finished Good ${id} not found`);
    return item;
  }

  async update(id: string, updateDto: UpdateFinishedGoodDto) {
    await this.findOne(id);
    return this.prisma.finished_goods_items.update({
      where: { id },
      data: {
        item_name: updateDto.itemName,
        dosage_form: updateDto.dosageForm,
        strength: updateDto.strength,
        pack_size: updateDto.packSize,
        shelf_life: updateDto.shelfLife,
        mrp: updateDto.mrp,
        status: updateDto.status as fg_status,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    await this.prisma.trash.create({
      data: { original_table: 'finished_goods_items', original_id: id, data: item as any },
    });
    await this.prisma.finished_goods_items.delete({ where: { id } });
    return { message: 'Finished Good moved to trash', id };
  }

  // --- Batch Management ---

  async addBatch(createDto: CreateFinishedGoodBatchDto) {
    return this.prisma.finished_goods_batches.create({
      data: {
        item_id: createDto.itemId,
        batch_number: createDto.batchNumber,
        mfg_date: new Date(createDto.mfgDate),
        expiry_date: new Date(createDto.expiryDate),
        quantity_produced: createDto.quantityProduced,
        quantity_available: createDto.quantityAvailable,
        qc_status: createDto.qcStatus as qc_release_status,
        warehouse_id: createDto.warehouseId,
      },
    });
  }

  async findAllBatches() {
    return this.prisma.finished_goods_batches.findMany({
      include: { 
        finished_goods_items: true,
        warehouses: true
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findBatchesByItem(itemId: string) {
    return this.prisma.finished_goods_batches.findMany({
      where: { item_id: itemId },
      include: { warehouses: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateBatch(id: string, updateDto: UpdateFinishedGoodBatchDto) {
    return this.prisma.finished_goods_batches.update({
      where: { id },
      data: {
        quantity_available: updateDto.quantityAvailable,
        qc_status: updateDto.qcStatus as qc_release_status,
        warehouse_id: updateDto.warehouseId,
        updated_at: new Date(),
      },
    });
  }

  async removeBatch(id: string) {
    return this.prisma.finished_goods_batches.delete({ where: { id } });
  }
}
