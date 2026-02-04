import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { warehouse_type, fg_status } from '@prisma/client';

@Injectable()
export class WarehousesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateWarehouseDto) {
    return this.prisma.warehouses.create({
      data: {
        name: createDto.name,
        type: createDto.type === 'Cold Chain' ? 'Cold_Chain' : 'Normal' as warehouse_type,
        location: createDto.location,
        temperature_range: createDto.temperatureRange,
        humidity_range: createDto.humidityRange,
        status: createDto.status as fg_status || 'Active',
      },
    });
  }

  async findAll() {
    return this.prisma.warehouses.findMany({ orderBy: { created_at: 'desc' } });
  }

  async findOne(id: string) {
    const warehouse = await this.prisma.warehouses.findUnique({ where: { id } });
    if (!warehouse) throw new NotFoundException(`Warehouse ${id} not found`);
    return warehouse;
  }

  async update(id: string, updateDto: UpdateWarehouseDto) {
    await this.findOne(id);
    return this.prisma.warehouses.update({
      where: { id },
      data: {
        name: updateDto.name,
        type: updateDto.type === 'Cold Chain' ? 'Cold_Chain' : 'Normal' as warehouse_type,
        location: updateDto.location,
        temperature_range: updateDto.temperatureRange,
        humidity_range: updateDto.humidityRange,
        status: updateDto.status as fg_status,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string) {
    const warehouse = await this.findOne(id);
    await this.prisma.trash.create({
      data: { original_table: 'warehouses', original_id: id, data: warehouse },
    });
    await this.prisma.warehouses.delete({ where: { id } });
    return { message: 'Warehouse moved to trash', id };
  }
}
