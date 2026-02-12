import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoodsReceiptNoteDto } from './dto/create-goods-receipt-note.dto';
import { UpdateGoodsReceiptNoteDto } from './dto/update-goods-receipt-note.dto';
import { qc_urgency } from '@prisma/client';

@Injectable()
export class GoodsReceiptNotesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateGoodsReceiptNoteDto) {
    return await this.prisma.$transaction(async (tx) => {
      let grnNumber = createDto.grnNumber;

      // Auto-generate GRN number if not provided
      if (!grnNumber) {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const lastGrn = await tx.goods_receipt_notes.findFirst({
          orderBy: { created_at: 'desc' },
          select: { grn_number: true },
        });

        let nextCount = 1;
        if (lastGrn?.grn_number) {
          const parts = lastGrn.grn_number.split('-');
          if (parts.length === 3) {
            const lastCount = parseInt(parts[2], 10);
            if (!isNaN(lastCount)) nextCount = lastCount + 1;
          }
        }
        grnNumber = `GRN-${dateStr}-${nextCount.toString().padStart(4, '0')}`;
      }

      // Insert Header
      const grn = await tx.goods_receipt_notes.create({
        data: {
          grn_number: grnNumber,
          grn_date: new Date(createDto.grnDate),
          po_id: createDto.poId,
          warehouse_location: createDto.warehouseLocation,
          received_by: createDto.receivedBy,
          qc_required: createDto.qcRequired,
          urgency_status: createDto.urgencyStatus as qc_urgency,
          qc_remarks: createDto.qcRemarks,
          status: 'Draft',
        },
      });

      // Insert Items
      if (createDto.items && createDto.items.length > 0) {
        await tx.goods_receipt_items.createMany({
          data: createDto.items.map(item => ({
            grn_id: grn.id,
            item_code: item.itemCode,
            item_name: item.itemName,
            ordered_qty: item.orderedQty,
            received_qty: item.receivedQty,
            rejected_qty: item.rejectedQty || 0,
            batch_number: item.batchNumber,
            mfg_date: item.mfgDate ? new Date(item.mfgDate) : null,
            expiry_date: item.expiryDate ? new Date(item.expiryDate) : null,
            storage_condition: item.storageCondition,
          })),
        });
      }

      const items = await tx.goods_receipt_items.findMany({ where: { grn_id: grn.id } });

      // Trigger RMQC generation if QC is required
      console.log('GRN Update/Create - QC Required:', createDto.qcRequired);
      if (createDto.qcRequired) {
        console.log('Triggering _generateRmqcInspections for GRN:', grn.id);
        await this._generateRmqcInspections(tx, grn.id, items);
      }

      return { ...grn, items };
    });
  }

  async findAll() {
    return this.prisma.goods_receipt_notes.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const grn = await this.prisma.goods_receipt_notes.findUnique({
      where: { id },
      include: { goods_receipt_items: true },
    });

    if (!grn) throw new NotFoundException(`GRN ${id} not found`);
    return { ...grn, items: grn.goods_receipt_items };
  }

  async update(id: string, updateDto: UpdateGoodsReceiptNoteDto) {
    await this.findOne(id);
    
    return await this.prisma.$transaction(async (tx) => {
      // Update header fields
      const grn = await tx.goods_receipt_notes.update({
        where: { id },
        data: {
          grn_date: updateDto.grnDate ? new Date(updateDto.grnDate) : undefined,
          warehouse_location: updateDto.warehouseLocation,
          received_by: updateDto.receivedBy,
          qc_required: updateDto.qcRequired,
          urgency_status: updateDto.urgencyStatus as qc_urgency,
          qc_remarks: updateDto.qcRemarks,
          updated_at: new Date(),
        },
      });

      // If items provided, replace them (delete old + insert new)
      if (updateDto.items && updateDto.items.length > 0) {
        // Delete existing items
        await tx.goods_receipt_items.deleteMany({ where: { grn_id: id } });
        
        // Insert new items
        await tx.goods_receipt_items.createMany({
          data: updateDto.items.map(item => ({
            grn_id: id,
            item_code: item.itemCode,
            item_name: item.itemName,
            ordered_qty: item.orderedQty,
            received_qty: item.receivedQty,
            rejected_qty: item.rejectedQty || 0,
            batch_number: item.batchNumber,
            mfg_date: item.mfgDate ? new Date(item.mfgDate) : null,
            expiry_date: item.expiryDate ? new Date(item.expiryDate) : null,
            storage_condition: item.storageCondition,
          })),
        });
      }

      // Return updated GRN with items
      const items = await tx.goods_receipt_items.findMany({ where: { grn_id: id } });

      // Trigger RMQC generation if QC is required
      if (updateDto.qcRequired) {
        // First delete any PENDING inspections for this GRN to avoid duplicates on update
        // We only delete Pending because Passed/Failed ones are historical records we shouldn't touch here
        await tx.rmqc_inspections.deleteMany({
          where: { grn_id: id, status: 'Pending' }
        });
        
        await this._generateRmqcInspections(tx, id, items);
      }

      return { ...grn, items };
    });
  }

  /**
   * Update GRN status and/or QC status
   * Used for workflow transitions (e.g., Draft -> Approved, QC Pending -> Passed)
   */
  async updateStatus(id: string, statusUpdate: { status?: string; qcStatus?: string }) {
    await this.findOne(id);
    
    const data: any = { updated_at: new Date() };
    if (statusUpdate.status) data.status = statusUpdate.status;
    if (statusUpdate.qcStatus) data.qc_status = statusUpdate.qcStatus;

    return this.prisma.goods_receipt_notes.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const grn = await this.findOne(id);

    await this.prisma.trash.create({
      data: { original_table: 'goods_receipt_notes', original_id: id, data: grn },
    });

    await this.prisma.goods_receipt_items.deleteMany({ where: { grn_id: id } });
    await this.prisma.goods_receipt_notes.delete({ where: { id } });

    return { message: 'GRN moved to trash', id };
  }

  /**
   * Helper to generate RMQC inspections and Batch records
   */
  private async _generateRmqcInspections(tx: any, grnId: string, items: any[]) {
    console.log(`Starting _generateRmqcInspections for GRN: ${grnId} with ${items.length} items.`);
    
    // 1. Get all raw materials to map item_code -> raw_material_id
    const rawMaterials = await tx.raw_materials.findMany();
    const materialMap = new Map<string, any>(rawMaterials.map((m: any) => [m.code, m]));
    console.log(`Loaded ${rawMaterials.length} raw materials for matching.`);

    for (const item of items) {
       console.log(`Processing item: ${item.item_code} (${item.item_name})`);
       const material = materialMap.get(item.item_code);
       if (!material) {
           console.warn(`Skipping RMQC for item ${item.item_code}: Not found in Raw Materials.`);
           continue; 
       }

       // 2. Create/Find Raw Material Batch (Quarantine)
       // Check if inventory record exists for this material
       let inventory = await tx.raw_material_inventory.findFirst({
         where: { material_id: material.id }
       });

       if (!inventory) {
         inventory = await tx.raw_material_inventory.create({
           data: {
             material_id: material.id,
             storage_condition: item.storage_condition || 'Ambient',
             status: 'Active'
           }
         });
       }

       // Create Batch Record
       // Note: We create a new batch record for this GRN receipt. 
       // If batch number exists, we might append or error? For now assuming unique batch per GRN/Item combo or allowing new entry.
       const batch = await tx.raw_material_batches.create({
         data: {
           inventory_id: inventory.id,
           batch_number: item.batch_number || `BATCH-${Date.now()}`,
           quantity_available: item.received_qty, // Initially available but in Quarantine
           expiry_date: item.expiry_date,
           qc_status: 'Quarantine',
           warehouse_location: '', // Can be updated later
         }
       });

       // 3. Create RMQC Inspection
       await tx.rmqc_inspections.create({
         data: {
           grn_id: grnId,
           raw_material_id: batch.id, // Linking to the specific batch created
           inspector_name: 'Pending Assignment',
           status: 'Pending',
           description: `Inspection for ${item.item_name} (${item.received_qty} units)`,
           inspection_date: new Date(),
         }
       });
    }
  }
}
