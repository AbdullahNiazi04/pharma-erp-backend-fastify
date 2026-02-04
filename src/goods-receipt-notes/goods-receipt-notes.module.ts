import { Module } from '@nestjs/common';
import { GoodsReceiptNotesService } from './goods-receipt-notes.service';
import { GoodsReceiptNotesController } from './goods-receipt-notes.controller';

@Module({
  controllers: [GoodsReceiptNotesController],
  providers: [GoodsReceiptNotesService],
  exports: [GoodsReceiptNotesService],
})
export class GoodsReceiptNotesModule {}
