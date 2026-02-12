
async function main() {
  console.log('Starting debug trigger...');
  const grnNumber = `GRN-DEBUG-${Date.now()}`;
  
  // We need a valid item code. I'll hardcode one I saw in logs or just use a generic strings and hope the backend logic handles "not found" gracefully by logging it (which is what I want to see).
  // Actually, I saw "RM-1770926505707-0" in previous logs? No.
  // I will try to fetch raw materials first via API.
  
  try {
      // 1. Fetch Raw Materials
      console.log('Fetching raw materials...');
      const rmRes = await fetch('http://localhost:4002/raw-materials');
      if (!rmRes.ok) {
          console.error('Failed to fetch raw materials:', rmRes.status);
          return;
      }
      const rawMaterials = await rmRes.json();
      if (rawMaterials.length === 0) {
          console.log('No raw materials found. Creating one...');
          const createRmRes = await fetch('http://localhost:4002/raw-materials', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  name: 'Debug Material',
                  code: `RM-DEBUG-${Date.now()}`,
                  description: 'Auto-created for Debug',
                  type: 'API',
                  unitOfMeasure: 'Kg'
              })
          });
          
          if (!createRmRes.ok) {
             const errText = await createRmRes.text();
             console.error('Failed to create raw material:', createRmRes.status, errText);
             return;
          }
          const newMaterial = await createRmRes.json();
          console.log('Created Material:', newMaterial.code);
          rawMaterials.push(newMaterial);
      }
      const material = rawMaterials[0];
      console.log('Using Material:', material.code, material.name);

      // 2. Create GRN
      console.log('Creating GRN...');
      const response = await fetch('http://localhost:4002/goods-receipt-notes', {
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
      console.log('GRN Create Response:', response.status, JSON.stringify(data, null, 2));

  } catch (e) {
      console.error('Error:', e);
  }
}

main();
