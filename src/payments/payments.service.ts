import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { payment_method, payment_status, batch_status, rm_status } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createDto: CreatePaymentDto) {
    const invoice = await this.prisma.invoices.findUnique({
      where: { id: createDto.invoiceId },
    });

    if (!invoice) {
        throw new NotFoundException(`Invoice ${createDto.invoiceId} not found`);
    }

    const payment = await this.prisma.payment.create({
      data: {
        invoice_id: createDto.invoiceId,
        payment_date: new Date(createDto.paymentDate),
        paymentMethod: createDto.paymentMethod as payment_method,
        amount_paid: createDto.amountPaid,
        tax_withheld: createDto.taxWithheld || 0,
        advance_adjustments: createDto.advanceAdjustments || 0,
        payment_reference: createDto.paymentReference,
        status: (createDto.status as payment_status) || 'Pending',
      },
    });

    if (payment.status === 'Completed') {
        await this.processInventoryUpdate(payment.invoice_id);
    }
    
    return payment;
  }

  async update(id: string, updateDto: UpdatePaymentDto) {
    this.logger.log(`Updating payment ${id} with data: ${JSON.stringify(updateDto)}`);
    
    try {
      const payment = await this.prisma.payment.update({
        where: { id },
        data: {
          payment_date: updateDto.paymentDate ? new Date(updateDto.paymentDate) : undefined,
          paymentMethod: updateDto.paymentMethod as payment_method,
          amount_paid: updateDto.amountPaid,
          tax_withheld: updateDto.taxWithheld,
          advance_adjustments: updateDto.advanceAdjustments,
          payment_reference: updateDto.paymentReference,
          status: updateDto.status as payment_status,
        },
      });

      this.logger.log(`Payment ${id} updated status to ${payment.status}`);

      if (payment.status === 'Completed') {
        this.logger.log(`Status is Completed. Triggering inventory update...`);
        await this.processInventoryUpdate(payment.invoice_id);
      }

      return payment;
    } catch (error) {
      this.logger.error(`Failed to update payment ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Helper to process inventory update
  private async processInventoryUpdate(invoiceId: string) {
      this.logger.log(`Starting inventory update for Invoice ${invoiceId}`);

      try {
        // [Existing inventory logic remains the same, but we will also update statuses]
        // Actually, let's keep inventory update focused on inventory, and call status update separately or within.
        // User requested: "When a payment is put to completed it should update the statuses of invoice, grn, po and pr"
        
        // Call the status update helper
        // await this.updateLinkedDocumentStatuses(invoiceId); // REVERTED

        const invoice = await this.prisma.invoices.findUnique({
            where: { id: invoiceId },
            include: { 
                purchase_orders: {
                    include: {
                        purchase_requisitions: {
                            include: { purchase_requisition_items: true }
                        }
                    }
                },
                goods_receipt_notes: true 
            }
        });

        if (!invoice) {
          this.logger.error(`Invoice ${invoiceId} not found during inventory update`);
          return;
        }

        const po = invoice.purchase_orders;
        const pr = po?.purchase_requisitions;
        const prItems = pr?.purchase_requisition_items || [];

        if (prItems.length === 0) {
          this.logger.warn(`No PR Items found for Invoice ${invoiceId} (PO: ${po?.id})`);
          // return; // Revert: uncomment return if it was there
          return;
        }

        const grn = invoice.goods_receipt_notes;
        this.logger.log(`Found GRN: ${grn ? grn.grn_number : 'NULL'}`);
        if (grn) {
            this.logger.log(`GRN stock_posted: ${grn.stock_posted}, id: ${grn.id}, qc_required: ${grn.qc_required}`);
        }
        
        if (grn && grn.stock_posted) {
            this.logger.log(`Stock already posted for linked GRN ${grn.grn_number}. Skipping inventory.`);
            return;
        }

        this.logger.log(`Processing inventory update for ${prItems.length} items from PR ${pr?.req_number}...`);

        let itemsProcessed = 0;
        for (const item of prItems) {
            // [Inventory logic unchanged]
            let rawMaterial = await this.prisma.raw_materials.findFirst({
                where: { 
                    OR: [
                        { code: item.item_code || '' },
                        { name: item.item_name || '' }
                    ]
                }
            });

            if (!rawMaterial) {
                this.logger.warn(`Raw Material not found for item: ${item.item_code} - ${item.item_name}`);
                continue; 
            }

            // [Inventory Create/Find Logic]
            let inventory = await this.prisma.raw_material_inventory.findFirst({
                where: { material_id: rawMaterial.id }
            });

            if (!inventory) {
                inventory = await this.prisma.raw_material_inventory.create({
                    data: {
                        material_id: rawMaterial.id,
                        status: 'Active' as rm_status,
                        storage_condition: 'Ambient'
                    }
                });
            }

            // [Batch Creation Logic]
            const batch = await this.prisma.raw_material_batches.create({
                data: {
                    inventory_id: inventory.id,
                    batch_number: `PR-BATCH-${pr?.req_number || 'NA'}-${item.item_code || item.item_name}`,
                    quantity_available: item.quantity, 
                    expiry_date: null, 
                    qc_status: 'Quarantine' as batch_status,
                    warehouse_location: grn?.warehouse_location || 'Main Warehouse'
                }
            });

            // Trigger RMQC Inspection if GRN exists
            if (grn) {
                await this.prisma.rmqc_inspections.create({
                    data: {
                        grn_id: grn.id,
                        raw_material_id: batch.id,
                        inspector_name: 'System',
                        description: `Auto-generated inspection for PR ${pr?.req_number}`,
                        status: 'Pending'
                    }
                });
                this.logger.log(`Created RMQC inspection for batch ${batch.batch_number}`);
            }

            itemsProcessed++;
        }

        this.logger.log(`Processed ${itemsProcessed} items from PR path.`);

        // Mark GRN as posted if it exists
        if (grn) {
          await this.prisma.goods_receipt_notes.update({
              where: { id: grn.id },
              data: { stock_posted: true }
          });
          this.logger.log(`Stock marked as posted on GRN ${grn.grn_number}`);
        }

      } catch (error) {
          this.logger.error(`Error processing inventory update: ${error.message}`, error.stack);
          throw error;
      }
  }
  // Removed updateLinkedDocumentStatuses method defined here in previous step

  findAll() {
    return this.prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { invoices: true },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { invoices: true },
    });
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    return payment;
  }

  remove(id: string) {
    return this.prisma.payment.delete({ where: { id } });
  }
}
