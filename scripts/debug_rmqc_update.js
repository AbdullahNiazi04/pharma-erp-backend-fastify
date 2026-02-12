
// Node 18+ has global fetch, but if not found, use dynamic import
// const fetch = global.fetch; 

async function main() {
  console.log('Starting RMQC Debug Script...');
  const API_URL = 'http://localhost:4002';

  try {
      // 1. Get All Inspectors
      console.log('Fetching Inspectors...');
      const inspectorsRes = await fetch(`${API_URL}/qc-inspectors`); // Assuming endpoint exists, check controller?
      // Wait, RmqcEditDrawer uses qcInspectorsApi.getAll which calls /qc-inspectors? No, let's check services.ts
      
      // Checking services.ts for inspectors endpoint... it might be missing or different.
      // If endpoint doesn't exist, that explains why the dropdown might vary or be empty? 
      // But let's assume /qc-inspectors exists, if not we'll fail here.
      
      // Actually, looking at previous file dumps, I didn't see QcInspectorsController. 
      // I saw QcInspectors *model*. Let's check if the endpoint exists.
      
  } catch (e) {
      console.log('Error in setup:', e.message);
  }

  try {
      // 2. Get All Inspections
      console.log('\nFetching RMQC Inspections...');
      const res = await fetch(`${API_URL}/rmqc`);
      if (!res.ok) throw new Error(`Failed to list: ${res.status} ${res.statusText}`);
      
      const inspections = await res.json();
      console.log(`Found ${inspections.length} inspections.`);
      
      if (inspections.length === 0) {
          console.log('No inspections to test.');
          return;
      }

      const target = inspections[0];
      console.log(`Testing with Inspection ID: ${target.id}`);

      // 3. View Inspection (replicating View page)
      console.log(`\n[VIEW] fetching /rmqc/${target.id}...`);
      const viewRes = await fetch(`${API_URL}/rmqc/${target.id}`);
      if (viewRes.ok) {
          console.log('[VIEW] SUCCESS:', await viewRes.json());
      } else {
          console.log('[VIEW] FAILED:', viewRes.status, await viewRes.text());
      }

      // 3.5 Fetch Inspectors to test FK update
      console.log('\nFetching Inspectors...');
      const inspectorsRes = await fetch(`${API_URL}/qc-inspectors`);
      let inspectorId = null;
      if (inspectorsRes.ok) {
          const inspectors = await inspectorsRes.json();
          if (inspectors.length > 0) {
              inspectorId = inspectors[0].id;
              console.log(`Using Inspector ID: ${inspectorId} (${inspectors[0].name})`);
          } else {
              console.log('No inspectors found.');
          }
      } else {
          console.log('Failed to fetch inspectors:', inspectorsRes.status);
      }

      // 4. Update Inspection (replicating Edit Drawer)
      // We need a valid inspector ID. 
      console.log(`\n[UPDATE] updating description ${inspectorId ? '& inspector ' : ''}for ${target.id}...`);
      const payload = {
          description: `Updated by Debug Script at ${new Date().toISOString()}`,
      };
      if (inspectorId) {
          // Frontend now sends camelCase? Wait, RmqcEditDrawer sends snake_case in "values" if the form fields are snake_case.
          // But I need to verify what the backend expects. The DTO expects snake_case.
          // Let's send snake_case first (standard). 
          // If that works, then I will try camelCase to see if THAT fails.
          payload.inspector_id = inspectorId; 
      }

      const updateRes = await fetch(`${API_URL}/rmqc/${target.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });
      
      if (updateRes.ok) {
          console.log('[UPDATE] SUCCESS:', await updateRes.json());
      } else {
          console.log('[UPDATE] FAILED:', updateRes.status, await updateRes.text());
      }

  } catch (err) {
      console.error('Debug Script Error:', err);
  }
}

main();
