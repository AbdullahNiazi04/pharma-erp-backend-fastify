
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');

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

async function main() {
  console.log('--- STARTING COMPLETE DATABASE CLEANUP ---');

  const tables = [
    'payments',
    'attendance',
    'cold_chain_logs',
    'customers',
    'dispatches',
    'employees',
    'departments',
    'designations',
    'finished_goods_batches',
    'finished_goods_items',
    'goods_receipt_items',
    'rmqc_inspections',
    'goods_receipt_notes',
    'payments', // Mentioned twice in schema? Wait, model Payment maps to payments.
    'invoices',
    'leave_requests',
    'pay_slips',
    'payroll_periods',
    'procurement_options',
    'purchase_order_items',
    'purchase_orders',
    'purchase_requisition_items',
    'purchase_requisitions',
    'raw_material_batches',
    'raw_material_inventory',
    'raw_materials',
    'sales_order_items',
    'sales_orders',
    'trash',
    'vendor_tags',
    'vendors',
    'warehouses',
    'import_documents',
    'import_orders'
  ];

  // Unique table list (just in case)
  const uniqueTables = [...new Set(tables)];

  try {
    console.log(`Clearing ${uniqueTables.length} tables...`);
    
    // We use TRUNCATE with CASCADE to handle all relationships at once.
    // This is much faster and cleaner than individual deletes.
    const query = `TRUNCATE TABLE ${uniqueTables.map(t => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE;`;
    
    await prisma.$executeRawUnsafe(query);
    
    console.log('✅ SUCCESS: All database tables have been cleared.');

  } catch (e) {
    console.error('❌ ERROR during cleanup:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
