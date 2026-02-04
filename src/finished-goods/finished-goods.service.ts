import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFinishedGoodDto } from './dto/create-finished-good.dto';
import { UpdateFinishedGoodDto } from './dto/update-finished-good.dto';
import { fg_status } from '@prisma/client';

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
      data: { original_table: 'finished_goods_items', original_id: id, data: item },
    });
    await this.prisma.finished_goods_items.delete({ where: { id } });
    return { message: 'Finished Good moved to trash', id };
  }
}
