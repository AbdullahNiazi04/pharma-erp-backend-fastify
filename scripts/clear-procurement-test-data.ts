import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Starting procurement data cleanup...');

  try {
    // 1. Delete Payments (Dependent on Invoices)
    const deletedPayments = await prisma.payment.deleteMany({});
    console.log(`✅ Deleted ${deletedPayments.count} payments`);

    // 2. Delete Invoices (Dependent on GRN & PO & Vendors)
    const deletedInvoices = await prisma.invoices.deleteMany({});
    console.log(`✅ Deleted ${deletedInvoices.count} invoices`);

    // 3. Delete RMQC Inspections (Dependent on GRN)
    const deletedRMQC = await prisma.rmqc_inspections.deleteMany({});
    console.log(`✅ Deleted ${deletedRMQC.count} RMQC inspections`);

    // 4. Delete GRN Items (Dependent on GRN)
    const deletedGRNItems = await prisma.goods_receipt_items.deleteMany({});
    console.log(`✅ Deleted ${deletedGRNItems.count} GRN items`);

    // 5. Delete GRNs (Dependent on PO)
    const deletedGRNs = await prisma.goods_receipt_notes.deleteMany({});
    console.log(`✅ Deleted ${deletedGRNs.count} goods receipt notes`);

    // 5a. Delete Import Documents (Dependent on Import Orders)
    const deletedImportDocs = await prisma.import_documents.deleteMany({});
    console.log(`✅ Deleted ${deletedImportDocs.count} import documents`);

    // 5b. Delete Import Orders (Dependent on PO & Vendors)
    const deletedImportOrders = await prisma.import_orders.deleteMany({});
    console.log(`✅ Deleted ${deletedImportOrders.count} import orders`);

    // 6. Delete PO Items (Dependent on PO)
    const deletedPOItems = await prisma.purchase_order_items.deleteMany({});
    console.log(`✅ Deleted ${deletedPOItems.count} PO items`);

    // 7. Delete Purchase Orders (Dependent on PR)
    const deletedPOs = await prisma.purchase_orders.deleteMany({});
    console.log(`✅ Deleted ${deletedPOs.count} purchase orders`);

    // 8. Delete PR Items (Dependent on PR)
    const deletedPRItems = await prisma.purchase_requisition_items.deleteMany({});
    console.log(`✅ Deleted ${deletedPRItems.count} PR items`);

    // 9. Delete Purchase Requisitions
    const deletedPRs = await prisma.purchase_requisitions.deleteMany({});
    console.log(`✅ Deleted ${deletedPRs.count} purchase requisitions`);

    console.log('✨ Procurement data cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
