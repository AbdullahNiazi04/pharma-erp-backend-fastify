
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting debug script...');

  // 1. Get a raw material
  const material = await prisma.raw_materials.findFirst();
  if (!material) {
    console.error('No raw materials found. Retrieveing failed.');
    return;
  }
  console.log('Found Raw Material:', material.code, material.name);

  // 2. Create a GRN with QC Required
  const grnNumber = `GRN-DEBUG-${Date.now()}`;
  console.log('Creating GRN:', grnNumber);

  try {
      // Simulation of Service Logic (since we can't easily import NestJS service here without context, 
      // we will manually run the transaction logic essentially, 
      // OR better, we just hit the API if the server is running? 
      // No, let's try to invoke the service method if possible, but that's hard in a standalone script.
      // Let's just USE THE API.
      
      // Wait, I can't easily use the API from here without fetch.
      // I will write a script that mimic the service logic to see if it works, 
      // BUT the user's issue is likely in the service integration or the data.
      
      // Let's use `fetch` to hit the running backend.
      const response = await fetch('http://localhost:4000/goods-receipt-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              grnDate: new Date().toISOString(),
              warehouseLocation: 'Test Warehouse',
              receivedBy: 'Debug Script',
              qcRequired: true,
              urgencyStatus: 'Normal',
              qcRemarks: 'Debug Test',
              items: [
                  {
                      itemCode: material.code,
                      itemName: material.name,
                      orderedQty: 100,
                      receivedQty: 50,
                      batchNumber: `BATCH-${Date.now()}`,
                      expiryDate: new Date(Date.now() + 1000000000).toISOString(),
                      storageCondition: 'Ambient'
                  }
              ]
          })
      });

      const data = await response.json();
      console.log('API Response Status:', response.status);
      console.log('API Response Data:', JSON.stringify(data, null, 2));

      if (response.ok) {
          // Check RMQC
          const inspection = await prisma.rmqc_inspections.findFirst({
              where: { grn_id: data.id }
          });
          console.log('RMQC Inspection Created:', inspection);
      }

  } catch (e) {
      console.error('Error:', e);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
