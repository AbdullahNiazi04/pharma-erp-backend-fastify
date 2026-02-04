import { PartialType } from '@nestjs/swagger';
import { CreateGoodsReceiptNoteDto } from './create-goods-receipt-note.dto';

export class UpdateGoodsReceiptNoteDto extends PartialType(CreateGoodsReceiptNoteDto) {}
