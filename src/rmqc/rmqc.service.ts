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

    // Sync to relations
    await this._syncStatusToRelations(inspection.grn_id, inspection.raw_material_id, 'Passed');

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

    // Sync to relations
    await this._syncStatusToRelations(inspection.grn_id, inspection.raw_material_id, 'Failed');

    return updated;
  }

  private async _syncStatusToRelations(grnId: string, batchId: string | null, status: string) {
    // 1. Update GRN QC Status
    await this.prisma.goods_receipt_notes.update({
      where: { id: grnId },
      data: { 
        qc_status: status as any, 
        qc_remarks: `${status} via RMQC updated at ${new Date().toISOString()}` 
      },
    });

    // 2. Update Batch Status if linked
    if (batchId) {
        const batchStatus = status === 'Passed' ? 'Approved' : 'Rejected';
        await this.prisma.raw_material_batches.update({
            where: { id: batchId },
            data: { qc_status: batchStatus as any }
        });
    }
  }

  async remove(id: string) {
    const inspection = await this.prisma.rmqc_inspections.findUnique({ where: { id } });
    if (!inspection) throw new NotFoundException('Inspection not found');
    
    return this.prisma.rmqc_inspections.delete({
        where: { id }
    });
  }

  async update(id: string, updateRmqcDto: UpdateRmqcDto) {
    const inspection = await this.prisma.rmqc_inspections.findUnique({ where: { id } });
    if (!inspection) throw new NotFoundException('Inspection not found');

    const data: any = { ...updateRmqcDto, updated_at: new Date() };

    // If inspector_id is updated, sync inspector_name
    if (updateRmqcDto.inspector_id) {
        const inspector = await this.prisma.qc_inspectors.findUnique({
            where: { id: updateRmqcDto.inspector_id }
        });
        if (inspector) {
            data.inspector_name = inspector.name;
        }
    }

    const updated = await this.prisma.rmqc_inspections.update({
      where: { id },
      data,
    });

    // If status was changed during update, sync to relations
    if (updateRmqcDto.status && updateRmqcDto.status !== inspection.status) {
        // If transitioning to Passed/Failed, trigger sync
        if (['Passed', 'Failed'].includes(updateRmqcDto.status)) {
            await this._syncStatusToRelations(updated.grn_id, updated.raw_material_id, updateRmqcDto.status);
        }
    }

    return updated;
  }
}
