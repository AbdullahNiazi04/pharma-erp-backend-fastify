import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQcInspectorDto } from './dto/create-qc-inspector.dto';
import { UpdateQcInspectorDto } from './dto/update-qc-inspector.dto';

@Injectable()
export class QcInspectorsService {
  constructor(private prisma: PrismaService) {}

  async create(createQcInspectorDto: CreateQcInspectorDto) {
    return this.prisma.qc_inspectors.create({
      data: createQcInspectorDto,
    });
  }

  async findAll() {
    return this.prisma.qc_inspectors.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const inspector = await this.prisma.qc_inspectors.findUnique({
      where: { id },
    });
    if (!inspector) {
      throw new NotFoundException(`QC Inspector with ID ${id} not found`);
    }
    return inspector;
  }

  async update(id: string, updateQcInspectorDto: UpdateQcInspectorDto) {
    const inspector = await this.findOne(id);
    return this.prisma.qc_inspectors.update({
      where: { id },
      data: updateQcInspectorDto,
    });
  }

  async remove(id: string) {
    const inspector = await this.findOne(id);
    return this.prisma.qc_inspectors.delete({
      where: { id },
    });
  }
}
