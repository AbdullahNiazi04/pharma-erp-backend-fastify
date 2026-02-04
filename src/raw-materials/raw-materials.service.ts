import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRawMaterialDto } from './dto/create-raw-material.dto';
import { UpdateRawMaterialDto } from './dto/update-raw-material.dto';
import { raw_material_type } from '@prisma/client';

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
      data: { original_table: 'raw_materials', original_id: id, data: material },
    });
    await this.prisma.raw_materials.delete({ where: { id } });
    return { message: 'Raw Material moved to trash', id };
  }
}
