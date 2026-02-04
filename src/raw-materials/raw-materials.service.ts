import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRawMaterialDto } from './dto/create-raw-material.dto';
import { UpdateRawMaterialDto } from './dto/update-raw-material.dto';
import { raw_material_type, rm_status, batch_status } from '@prisma/client';
import { CreateRawMaterialInventoryDto } from './dto/create-raw-material-inventory.dto';
import { UpdateRawMaterialInventoryDto } from './dto/update-raw-material-inventory.dto';
import { CreateRawMaterialBatchDto } from './dto/create-raw-material-batch.dto';
import { UpdateRawMaterialBatchDto } from './dto/update-raw-material-batch.dto';

@Injectable()
export class RawMaterialsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateRawMaterialDto) {
    return this.prisma.raw_materials.create({
      data: {
        code: createDto.code,
        name: createDto.name,
        type: createDto.type as raw_material_type,
        unit_of_measure: createDto.unitOfMeasure,
        description: createDto.description,
      },
    });
  }

  async findAll() {
    return this.prisma.raw_materials.findMany({ orderBy: { created_at: 'desc' } });
  }

  async findOne(id: string) {
    const material = await this.prisma.raw_materials.findUnique({ where: { id } });
    if (!material) throw new NotFoundException(`Raw Material ${id} not found`);
    return material;
  }

  async update(id: string, updateDto: UpdateRawMaterialDto) {
    await this.findOne(id);
    return this.prisma.raw_materials.update({
      where: { id },
      data: {
        name: updateDto.name,
        type: updateDto.type as raw_material_type,
        unit_of_measure: updateDto.unitOfMeasure,
        description: updateDto.description,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string) {
    const material = await this.findOne(id);
    await this.prisma.trash.create({
      data: { original_table: 'raw_materials', original_id: id, data: material as any },
    });
    await this.prisma.raw_materials.delete({ where: { id } });
    return { message: 'Raw Material moved to trash', id };
  }

  // --- Inventory Configuration ---

  async createInventory(createDto: CreateRawMaterialInventoryDto) {
    return this.prisma.raw_material_inventory.create({
      data: {
        material_id: createDto.materialId,
        storage_condition: createDto.storageCondition,
        reorder_level: createDto.reorderLevel,
        safety_stock: createDto.safetyStock,
        status: createDto.status as rm_status,
      },
    });
  }

  async findAllInventory() {
    return this.prisma.raw_material_inventory.findMany({
      include: { raw_materials: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateInventory(id: string, updateDto: UpdateRawMaterialInventoryDto) {
    return this.prisma.raw_material_inventory.update({
      where: { id },
      data: {
        storage_condition: updateDto.storageCondition,
        reorder_level: updateDto.reorderLevel,
        safety_stock: updateDto.safetyStock,
        status: updateDto.status as rm_status,
        updated_at: new Date(),
      },
    });
  }

  async removeInventory(id: string) {
    return this.prisma.raw_material_inventory.delete({ where: { id } });
  }

  // --- Batch Management ---

  async addBatch(createDto: CreateRawMaterialBatchDto) {
    return this.prisma.raw_material_batches.create({
      data: {
        inventory_id: createDto.inventoryId,
        batch_number: createDto.batchNumber,
        quantity_available: createDto.quantityAvailable,
        expiry_date: createDto.expiryDate ? new Date(createDto.expiryDate) : null,
        qc_status: createDto.qcStatus as batch_status,
        warehouse_location: createDto.warehouseLocation,
      },
    });
  }

  async findAllBatches() {
    return this.prisma.raw_material_batches.findMany({
      include: { raw_material_inventory: { include: { raw_materials: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async findBatchesByInventory(inventoryId: string) {
    return this.prisma.raw_material_batches.findMany({
      where: { inventory_id: inventoryId },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateBatch(id: string, updateDto: UpdateRawMaterialBatchDto) {
    return this.prisma.raw_material_batches.update({
      where: { id },
      data: {
        quantity_available: updateDto.quantityAvailable,
        expiry_date: updateDto.expiryDate ? new Date(updateDto.expiryDate) : undefined,
        qc_status: updateDto.qcStatus as batch_status,
        warehouse_location: updateDto.warehouseLocation,
        updated_at: new Date(),
      },
    });
  }

  async removeBatch(id: string) {
    return this.prisma.raw_material_batches.delete({ where: { id } });
  }
}
