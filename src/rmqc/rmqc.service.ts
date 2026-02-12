import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRmqcDto } from './dto/create-rmqc.dto';
import { UpdateRmqcDto } from './dto/update-rmqc.dto';

@Injectable()
export class RmqcService {
  constructor(private prisma: PrismaService) {}

  async create(createRmqcDto: CreateRmqcDto) {
    // Validate GRN exists
    const grn = await this.prisma.goods_receipt_notes.findUnique({
      where: { id: createRmqcDto.grn_id },
    });

    if (!grn) throw new NotFoundException('GRN not found');
    if (!grn.qc_required) throw new BadRequestException('GRN does not require QC');

    // Create Inspection
    return this.prisma.rmqc_inspections.create({
      data: {
        grn_id: createRmqcDto.grn_id,
        raw_material_id: createRmqcDto.raw_material_id,
        inspector_name: createRmqcDto.inspector_name,
        description: createRmqcDto.description,
        images: createRmqcDto.images || [],
        documents: createRmqcDto.documents || [],
        status: 'Pending',
      },
    });
  }

  async findAll() {
    return this.prisma.rmqc_inspections.findMany({
      include: {
        goods_receipt_notes: {
          select: { grn_number: true, received_by: true },
        },
        raw_material_batches: {
          select: { batch_number: true, raw_material_inventory: { include: { raw_materials: true } } },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const inspection = await this.prisma.rmqc_inspections.findUnique({
      where: { id },
      include: {
        goods_receipt_notes: true,
        raw_material_batches: {
          include: { raw_material_inventory: { include: { raw_materials: true } } },
        },
      },
    });
    if (!inspection) throw new NotFoundException('Inspection not found');
    return inspection;
  }

  async update(id: string, updateRmqcDto: UpdateRmqcDto) {
    return this.prisma.rmqc_inspections.update({
      where: { id },
      data: {
        ...updateRmqcDto,
        updated_at: new Date(),
      },
    });
  }

  async passInspection(id: string) {
    const inspection = await this.prisma.rmqc_inspections.findUnique({ where: { id } });
    if (!inspection) throw new NotFoundException('Inspection not found');

    // Update Inspection Status, Completed At
    const updated = await this.prisma.rmqc_inspections.update({
      where: { id },
      data: {
        status: 'Passed',
        completed_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Update GRN QC Status
    await this.prisma.goods_receipt_notes.update({
      where: { id: inspection.grn_id },
      data: { qc_status: 'Passed', qc_remarks: `Passed via RMQC ${id}` },
    });

    // Update Batch Status if linked
    if (inspection.raw_material_id) {
        // Find raw_material_id (which is batch_id in our schema logic)
        await this.prisma.raw_material_batches.update({
            where: { id: inspection.raw_material_id },
            data: { qc_status: 'Approved' } // Check if Approved is in batch_status enum
        });
    }

    return updated;
  }

  async failInspection(id: string) {
    const inspection = await this.prisma.rmqc_inspections.findUnique({ where: { id } });
    if (!inspection) throw new NotFoundException('Inspection not found');

    const updated = await this.prisma.rmqc_inspections.update({
      where: { id },
      data: {
        status: 'Failed',
        completed_at: new Date(),
        updated_at: new Date(),
      },
    });

    await this.prisma.goods_receipt_notes.update({
      where: { id: inspection.grn_id },
      data: { qc_status: 'Failed', qc_remarks: `Failed via RMQC ${id}` },
    });

    if (inspection.raw_material_id) {
        await this.prisma.raw_material_batches.update({
            where: { id: inspection.raw_material_id },
            data: { qc_status: 'Rejected' }
        });
    }

    return updated;
  }
}
