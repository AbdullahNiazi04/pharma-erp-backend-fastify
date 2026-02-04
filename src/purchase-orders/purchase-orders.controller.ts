import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';

@ApiTags('purchase-orders')
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly poService: PurchaseOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new purchase order' })
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createDto: CreatePurchaseOrderDto) {
    return this.poService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchase orders' })
  findAll() {
    return this.poService.findAll();
  }

  @Get('vendor-history/:vendorId')
  @ApiOperation({ summary: 'Get PO history for a vendor' })
  getVendorHistory(@Param('vendorId') vendorId: string) {
    return this.poService.getVendorHistory(vendorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a purchase order by ID' })
  findOne(@Param('id') id: string) {
    return this.poService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a purchase order' })
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateDto: UpdatePurchaseOrderDto) {
    return this.poService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a purchase order (soft delete)' })
  remove(@Param('id') id: string) {
    return this.poService.remove(id);
  }
}
