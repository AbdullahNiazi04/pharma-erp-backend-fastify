
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load .env manually
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split(/\r?\n/).forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) return;
    const index = trimmedLine.indexOf('=');
    if (index !== -1) {
      const key = trimmedLine.slice(0, index).trim();
      const value = trimmedLine.slice(index + 1).trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const log = (msg) => console.log(msg);

async function main() {
  log('Starting RMQC Trigger Verification...');

  try {
    const id = crypto.randomUUID().slice(0, 8);
    
    // 1. Setup Master Data
    log('1. Setting up Test Vendor and Material...');
    const vendor = await prisma.vendors.create({
        data: { legal_name: 'QC Test Vendor ' + id, vendor_type: 'Raw Material' }
    });

    const material = await prisma.raw_materials.create({
        data: {
            name: 'QC Test Material ' + id,
            code: 'RM-QC-' + id,
            type: 'API',
            unit_of_measure: 'KG'
        }
    });

    // 2. Procurement Flow
    log('2. Creating PR...');
    const pr = await prisma.purchase_requisitions.create({
        data: {
            req_number: 'PR-QC-' + id,
            requisition_date: new Date(),
            requested_by: 'QA Admin',
            purchase_requisition_items: {
                create: {
                    item_name: material.name,
                    item_code: material.code,
                    quantity: 50,
                    category: 'API'
                }
            }
        }
    });

    log('3. Creating PO...');
    const po = await prisma.purchase_orders.create({
        data: {
            po_number: 'PO-QC-' + id,
            po_date: new Date(),
            vendor_id: vendor.id,
            reference_pr_id: pr.id,
            total_amount: 500.0,
            status: 'Issued'
        }
    });

    log('4. Creating GRN (QC Required: true)...');
    const grn = await prisma.goods_receipt_notes.create({
        data: {
            grn_number: 'GRN-QC-' + id,
            grn_date: new Date(),
            po_id: po.id,
            received_by: 'QA Admin',
            qc_required: true,
            qc_status: 'Pending',
            warehouse_location: 'Main Warehouse'
        }
    });

    log('5. Creating Invoice...');
    const invoice = await prisma.invoices.create({
        data: {
            invoice_number: 'INV-QC-' + id,
            invoice_date: new Date(),
            po_id: po.id,
            grn_id: grn.id,
            vendor_id: vendor.id,
            amount: 500.0,
            due_date: new Date(),
        }
    });

    // 6. Complete Payment via API
    log('6. Completing Payment via API...');
    const port = process.env.PORT || 4001;
    const apiUrl = `http://localhost:${port}/payments`;
    
    const paymentPayload = {
        invoiceId: invoice.id,
        paymentDate: new Date().toISOString(),
        amountPaid: 500.0,
        paymentMethod: 'Bank_Transfer',
        status: 'Completed'
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload)
    });

    if (!response.ok) {
        throw new Error('API Error: ' + response.status + ' - ' + (await response.text()));
    }
    log('Payment Completed via API.');

    // 7. Verification
    log('7. Verifying RMQC Trigger...');
    await new Promise(r => setTimeout(r, 2000));

    const batch = await prisma.raw_material_batches.findFirst({
        where: { batch_number: { contains: pr.req_number } }
    });

    if (batch && batch.qc_status === 'Quarantine') {
        log('✅ SUCCESS: Batch created in Quarantine.');
    } else {
        log('❌ FAILURE: Batch not in Quarantine. Found: ' + (batch?.qc_status || 'NOT FOUND'));
    }

    const inspection = await prisma.rmqc_inspections.findFirst({
        where: { grn_id: grn.id }
    });

    if (inspection && inspection.status === 'Pending') {
        log('✅ SUCCESS: RMQC inspection request created.');
        log('Inspection Details: ' + JSON.stringify(inspection));
    } else {
        log('❌ FAILURE: RMQC inspection not found or wrong status.');
    }

  } catch (e) {
      console.error('Error:', e);
  } finally {
      await prisma.$disconnect();
      await pool.end();
  }
}

main();
