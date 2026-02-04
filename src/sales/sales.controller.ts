import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sales order' })
  @UsePipes(new ValidationPipe({ transform: true }))
  createOrder(@Body() createDto: CreateSalesOrderDto) {
    return this.salesService.createOrder(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales orders' })
  findAllOrders() {
    return this.salesService.findAllOrders();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sales order by ID' })
  findOneOrder(@Param('id') id: string) {
    return this.salesService.findOneOrder(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update sales order' })
  @UsePipes(new ValidationPipe({ transform: true }))
  updateOrder(@Param('id') id: string, @Body() updateDto: UpdateSalesOrderDto) {
    return this.salesService.updateOrder(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete sales order (soft delete)' })
  removeOrder(@Param('id') id: string) {
    return this.salesService.removeOrder(id);
  }
}
