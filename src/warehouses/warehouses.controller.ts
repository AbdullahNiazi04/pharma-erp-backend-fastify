import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@ApiTags('warehouses')
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createDto: CreateWarehouseDto) { return this.warehousesService.create(createDto); }

  @Get()
  findAll() { return this.warehousesService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.warehousesService.findOne(id); }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateDto: UpdateWarehouseDto) { return this.warehousesService.update(id, updateDto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.warehousesService.remove(id); }
}
