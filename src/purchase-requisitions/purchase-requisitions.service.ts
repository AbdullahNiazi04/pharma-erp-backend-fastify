import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseRequisitionDto } from './dto/create-purchase-requisition.dto';
import { UpdatePurchaseRequisitionDto } from './dto/update-purchase-requisition.dto';
import { pr_priority } from '@prisma/client';

@Injectable()
export class PurchaseRequisitionsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreatePurchaseRequisitionDto) {
    // Calculate Total Cost
    let prTotalCost = 0;
    createDto.items.forEach(item => {
      if (item.estimatedUnitCost && item.quantity) {
        prTotalCost += (item.estimatedUnitCost * item.quantity);
      }
    });

    // Use transaction for creating PR and items
    return await this.prisma.$transaction(async (tx) => {
      // Insert Header
      const newPr = await tx.purchase_requisitions.create({
        data: {
          req_number: createDto.reqNumber,
          requisition_date: new Date(createDto.requisitionDate),
          requested_by: createDto.requestedBy,
          department: createDto.department,
          cost_center: createDto.costCenter,
          priority: createDto.priority as pr_priority,
          expected_delivery_date: createDto.expectedDeliveryDate 
            ? new Date(createDto.expectedDeliveryDate) 
            : null,
          budget_reference: createDto.budgetReference,
          status: 'Draft',
          total_estimated_cost: prTotalCost,
        },
      });

      // Insert Items
      if (createDto.items && createDto.items.length > 0) {
        await tx.purchase_requisition_items.createMany({
          data: createDto.items.map(item => ({
            pr_id: newPr.id,
            item_code: item.itemCode,
            item_name: item.itemName,
            category: item.category,
            uom: item.uom,
            quantity: item.quantity,
            estimated_unit_cost: item.estimatedUnitCost,
            total_cost: (item.estimatedUnitCost && item.quantity) 
              ? item.estimatedUnitCost * item.quantity 
              : null,
            preferred_vendor_id: item.preferredVendorId,
            specification: item.specification,
          })),
        });
      }

      // Fetch with items and return
      const items = await tx.purchase_requisition_items.findMany({
        where: { pr_id: newPr.id },
      });

      return { ...newPr, items };
    });
  }

  async findAll() {
    return this.prisma.purchase_requisitions.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const pr = await this.prisma.purchase_requisitions.findUnique({
      where: { id },
      include: { purchase_requisition_items: true },
    });

    if (!pr) {
      throw new NotFoundException(`PR ${id} not found`);
    }

    return {
      ...pr,
      items: pr.purchase_requisition_items,
    };
  }

  async update(id: string, updateDto: UpdatePurchaseRequisitionDto) {
    const existingPr = await this.findOne(id);

    if (existingPr.status === 'Converted') {
      throw new BadRequestException('Cannot edit a converted PR. It has already been processed.');
    }

    // If PR was Approved, any edit should reset it to Pending Approval
    const newStatus = (existingPr.status === 'Approved' && !updateDto) 
      ? 'Pending_Approval' 
      : existingPr.status;

    return this.prisma.purchase_requisitions.update({
      where: { id },
      data: {
        req_number: updateDto.reqNumber,
        requisition_date: updateDto.requisitionDate 
          ? new Date(updateDto.requisitionDate) 
          : undefined,
        requested_by: updateDto.requestedBy,
        department: updateDto.department,
        cost_center: updateDto.costCenter,
        priority: updateDto.priority as pr_priority,
        expected_delivery_date: updateDto.expectedDeliveryDate 
          ? new Date(updateDto.expectedDeliveryDate) 
          : undefined,
        budget_reference: updateDto.budgetReference,
        status: newStatus as any,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string) {
    // Check if PR is linked to any PO
    const linkedPOs = await this.prisma.purchase_orders.findMany({
      where: { reference_pr_id: id },
      select: { po_number: true },
    });

    if (linkedPOs.length > 0) {
      throw new BadRequestException(
        `Cannot delete PR because it is linked to Purchase Order(s): ${linkedPOs.map(p => p.po_number).join(', ')}`
      );
    }

    const pr = await this.findOne(id);

    // Archive to trash
    await this.prisma.trash.create({
      data: {
        original_table: 'purchase_requisitions',
        original_id: id,
        data: pr,
      },
    });

    // Delete Items first (FK dependency)
    await this.prisma.purchase_requisition_items.deleteMany({
      where: { pr_id: id },
    });

    // Delete Header
    await this.prisma.purchase_requisitions.delete({
      where: { id },
    });

    return { message: 'PR moved to trash', id };
  }
}
