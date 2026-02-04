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
// Finance
import { InvoicesModule } from './invoices/invoices.module';
// Inventory
import { RawMaterialsModule } from './raw-materials/raw-materials.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { FinishedGoodsModule } from './finished-goods/finished-goods.module';
// Sales
import { CustomersModule } from './customers/customers.module';
import { SalesModule } from './sales/sales.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    // Procurement
    VendorsModule,
    PurchaseRequisitionsModule,
    PurchaseOrdersModule,
    GoodsReceiptNotesModule,
    ProcurementOptionsModule,
    // Finance
    InvoicesModule,
    // Inventory
    RawMaterialsModule,
    WarehousesModule,
    FinishedGoodsModule,
    // Sales
    CustomersModule,
    SalesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
