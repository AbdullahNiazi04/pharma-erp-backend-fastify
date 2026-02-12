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
  console.log('--- Seeding QC Inspectors ---');
  try {
    const inspectors = ['John Doe', 'Jane Smith', 'Alice Cooper', 'Bob Marley'];
    
    for (const name of inspectors) {
        // Check if exists
        const existing = await prisma.qc_inspectors.findFirst({
            where: { name }
        });

        if (!existing) {
            await prisma.qc_inspectors.create({
                data: { name, status: 'Active' }
            });
            console.log(`Created Inspector: ${name}`);
        } else {
            console.log(`Inspector exists: ${name}`);
        }
    }
    console.log('Seeding completed.');

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
