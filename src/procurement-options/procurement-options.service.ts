import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcurementOptionDto } from './dto/create-procurement-option.dto';

@Injectable()
export class ProcurementOptionsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateProcurementOptionDto) {
    return this.prisma.procurement_options.create({
      data: {
        type: createDto.type,
        label: createDto.label,
        value: createDto.value,
        is_system: createDto.isSystem || false,
      },
    });
  }

  async findAll() {
    return this.prisma.procurement_options.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findByType(type: string) {
    return this.prisma.procurement_options.findMany({
      where: { type },
      orderBy: { label: 'asc' },
    });
  }

  async findOne(id: string) {
    const option = await this.prisma.procurement_options.findUnique({
      where: { id },
    });
    if (!option) throw new NotFoundException(`Option ${id} not found`);
    return option;
  }

  async remove(id: string) {
    const option = await this.findOne(id);
    
    if (option.is_system) {
      throw new BadRequestException('Cannot delete a system option');
    }

    await this.prisma.procurement_options.delete({ where: { id } });
    return { message: 'Option deleted', id };
  }
}
