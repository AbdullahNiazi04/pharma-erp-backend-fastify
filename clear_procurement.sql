/* 
  Raw SQL to clear functionality test data for Procurement Module.
  Cascades to items and related tables.
*/

TRUNCATE TABLE 
  "Payment",
  "invoices", 
  "rmqc_inspections",
  "goods_receipt_items", 
  "goods_receipt_notes",
  "import_documents",
  "import_orders",
  "purchase_order_items", 
  "purchase_orders", 
  "purchase_requisition_items", 
  "purchase_requisitions"
CASCADE;
