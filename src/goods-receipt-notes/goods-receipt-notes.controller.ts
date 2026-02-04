import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GoodsReceiptNotesService } from './goods-receipt-notes.service';
import { CreateGoodsReceiptNoteDto } from './dto/create-goods-receipt-note.dto';
import { UpdateGoodsReceiptNoteDto } from './dto/update-goods-receipt-note.dto';

@ApiTags('goods-receipt-notes')
@Controller('goods-receipt-notes')
export class GoodsReceiptNotesController {
  constructor(private readonly grnService: GoodsReceiptNotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new goods receipt note' })
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createDto: CreateGoodsReceiptNoteDto) {
    return this.grnService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all goods receipt notes' })
  findAll() {
    return this.grnService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a goods receipt note by ID' })
  findOne(@Param('id') id: string) {
    return this.grnService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a goods receipt note' })
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateDto: UpdateGoodsReceiptNoteDto) {
    return this.grnService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a goods receipt note (soft delete)' })
  remove(@Param('id') id: string) {
    return this.grnService.remove(id);
  }
}
