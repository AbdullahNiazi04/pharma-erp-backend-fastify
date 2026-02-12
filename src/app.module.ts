import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
// Procurement
import { VendorsModule } from './vendors/vendors.module';
import { PurchaseRequisitionsModule } from './purchase-requisitions/purchase-requisitions.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { GoodsReceiptNotesModule } from './goods-receipt-notes/goods-receipt-notes.module';
import { ProcurementOptionsModule } from './procurement-options/procurement-options.module';
import { ImportsModule } from './imports/imports.module';
// Finance
import { InvoicesModule } from './invoices/invoices.module';
// Inventory
import { RawMaterialsModule } from './raw-materials/raw-materials.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { FinishedGoodsModule } from './finished-goods/finished-goods.module';
// Sales
import { CustomersModule } from './customers/customers.module';
import { SalesModule } from './sales/sales.module';
import { RmqcModule } from './rmqc/rmqc.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    // Procurement
    VendorsModule,
    PurchaseRequisitionsModule,
    RmqcModule,
    PurchaseOrdersModule,
    GoodsReceiptNotesModule,
    ProcurementOptionsModule,
    ImportsModule,
    // Finance
    InvoicesModule,
    // Inventory
    // Inventory
    RawMaterialsModule,
    WarehousesModule,
    FinishedGoodsModule,
    // Sales
    CustomersModule,
    SalesModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
