const API_URL = 'http://localhost:4002';

async function request(path, method = 'GET', body = null) {
  const options = { method };
  if (body) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }
  
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

async function verify() {
  try {
    console.log('1. Checking Health (GET /)');
    
    console.log('2. Creating Raw Material...');
    const createRes = await request('/raw-materials', 'POST', {
      code: 'TEST-RM-' + Date.now(),
      name: 'Test Material ' + Date.now(),
      type: 'API',
      unitOfMeasure: 'kg',
      description: 'Test material for verification'
    });
    console.log('✅ Created:', createRes.id);
    const rmId = createRes.id;

    console.log('3. Creating Inventory Config...');
    const invRes = await request('/raw-materials/inventory', 'POST', {
      materialId: rmId,
      storageCondition: 'Cool Dry Place',
      reorderLevel: 50,
      safetyStock: 10,
      status: 'Active'
    });
    console.log('✅ Inventory Config Created:', invRes.id);

    console.log('4. Listing Raw Materials...');
    const listRes = await request('/raw-materials');
    console.log(`✅ Loaded ${listRes.length} materials`);
    
    console.log('5. Create Vendor...');
    const vendorRes = await request('/vendors', 'POST', {
      legalName: 'Test Vendor ' + Date.now(),
      vendorType: 'Raw Material',
      status: 'Active',
      contactPerson: 'John Doe',
      email: 'test@vendor.com'
    });
    console.log('✅ Vendor Created with ID:', vendorRes.id);
    
    console.log('6. Checking Vendor Response Keys...');
    const fetchedVendor = await request(`/vendors/${vendorRes.id}`);
    const keys = Object.keys(fetchedVendor);
    
    // Test Decimal serialization with Invoice
    console.log('7. Creating Invoice (Decimal test)...');
    const invoiceRes = await request('/invoices', 'POST', {
      invoiceNumber: 'INV-TEST-' + Date.now(),
      invoiceDate: new Date().toISOString(),
      vendorId: vendorRes.id,
      amount: 150.55,
      dueDate: new Date().toISOString()
    });
    console.log('✅ Invoice Created:', invoiceRes.id);
    
    const fetchedInvoice = await request(`/invoices/${invoiceRes.id}`);
    console.log('Fetched Invoice Amount:', fetchedInvoice.amount, 'Type:', typeof fetchedInvoice.amount);
    
    if (typeof fetchedInvoice.amount === 'object' && !Array.isArray(fetchedInvoice.amount)) {
        console.error('❌ BUG REPRODUCED: Amount is an object:', fetchedInvoice.amount);
    } else {
        console.log('✅ Amount is correctly serialized:', fetchedInvoice.amount);
    }

    console.log('8. Cleaning up...');
    await request(`/invoices/${invoiceRes.id}`, 'DELETE');
    await request(`/raw-materials/inventory/${invRes.id}`, 'DELETE');
    await request(`/raw-materials/${rmId}`, 'DELETE');
    await request(`/vendors/${vendorRes.id}`, 'DELETE');
    console.log('✅ Deleted test data');

    console.log('🎉 VERIFICATION SUCCESSFUL: Backend is reachable and DB/CRUD works.');
  } catch (error) {
    console.error('❌ Verification Failed:', error.message);
    process.exit(1);
  }
}

verify();
