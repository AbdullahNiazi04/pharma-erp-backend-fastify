
async function main() {
  console.log('Starting PR Item Code Verification...');
  const newItemName = `Test Item ${Date.now()}`;
  
  try {
      // 1. Create PR with NO item code
      console.log(`Creating PR with item name: "${newItemName}" (No Item Code)...`);
      const createRes = await fetch('http://localhost:4002/purchase-requisitions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              reqNumber: `PR-VERIFY-${Date.now()}`,
              requisitionDate: new Date().toISOString(),
              requestedBy: 'Verification Script',
              priority: 'Normal',
              items: [
                  {
                      itemName: newItemName,
                      quantity: 10,
                      category: 'API'
                  }
              ]
          })
      });

      if (!createRes.ok) {
          console.error('Failed to create PR:', createRes.status, await createRes.text());
          return;
      }

      const prData = await createRes.json();
      console.log('PR Created:', prData.req_number);
      const item = prData.items[0];
      
      console.log('PR Item Details:');
      console.log(`- Name: ${item.item_name}`);
      console.log(`- Code: ${item.item_code}`);

      if (item.item_code) {
          console.log('SUCCESS: Item Code was auto-generated.');
      } else {
          console.error('FAILURE: Item Code is missing.');
      }

      // 2. Verify Raw Material was created
      const rmRes = await fetch('http://localhost:4002/raw-materials');
      const materials = await rmRes.json();
      const material = materials.find(m => m.code === item.item_code);
      
      if (material) {
          console.log('SUCCESS: Raw Material record found:', material.name);
      } else {
          console.error('FAILURE: Raw Material record not found for code:', item.item_code);
      }

  } catch (e) {
      console.error('Error:', e);
  }
}

main();
