
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
  console.log('--- Database State Check ---');

  try {
    const batches = await prisma.raw_material_batches.findMany({
      orderBy: { created_at: 'desc' },
      take: 5
    });
    console.log('Recent Batches:', JSON.stringify(batches, null, 2));

    const inspections = await prisma.rmqc_inspections.findMany({
      orderBy: { created_at: 'desc' },
      take: 5,
      include: {
        goods_receipt_notes: true,
        raw_material_batches: true
      }
    });
    console.log('Recent Inspections:', JSON.stringify(inspections, null, 2));

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
