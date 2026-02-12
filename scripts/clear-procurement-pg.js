const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually load .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  console.log('Loading .env from', envPath);
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
      process.env[key] = value;
    }
  });
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not found in environment');
  process.exit(1);
}

const client = new Client({
  connectionString: connectionString,
});

async function main() {
  console.log('Connecting to database...');
  try {
    await client.connect();
    console.log('Connected!');

    console.log('Connected!');

    // const res = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname='public';`);
    // console.log('Tables found:', res.rows.map(r => r.tablename).sort());
    
    console.log('Clearing procurement tables...');
    const query = `
      TRUNCATE TABLE 
        payments,
        invoices, 
        rmqc_inspections,
        goods_receipt_items, 
        goods_receipt_notes,
        import_documents,
        import_orders,
        purchase_order_items, 
        purchase_orders, 
        purchase_requisition_items, 
        purchase_requisitions
      CASCADE;
    `;
    
    await client.query(query);
    console.log('✅ Procurement tables allocated and cleared successfully!');
  } catch (err) {
    console.error('❌ Error executing query:', err);
  } finally {
    await client.end();
  }
}

main();
