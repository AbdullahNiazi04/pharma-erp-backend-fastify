import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RawMaterialsService } from './raw-materials.service';
import { CreateRawMaterialDto } from './dto/create-raw-material.dto';
import { UpdateRawMaterialDto } from './dto/update-raw-material.dto';
import { CreateRawMaterialInventoryDto } from './dto/create-raw-material-inventory.dto';
import { UpdateRawMaterialInventoryDto } from './dto/update-raw-material-inventory.dto';
import { CreateRawMaterialBatchDto } from './dto/create-raw-material-batch.dto';
import { UpdateRawMaterialBatchDto } from './dto/update-raw-material-batch.dto';

@ApiTags('raw-materials')
@Controller('raw-materials')
export class RawMaterialsController {
  constructor(private readonly rmService: RawMaterialsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createDto: CreateRawMaterialDto) { return this.rmService.create(createDto); }

  @Get()
  findAll() { return this.rmService.findAll(); }
  
  // --- Inventory Endpoints ---
  
  @Post('inventory')
  @ApiOperation({ summary: 'Create inventory configuration for raw material' })
  @UsePipes(new ValidationPipe({ transform: true }))
  createInventory(@Body() createDto: CreateRawMaterialInventoryDto) { return this.rmService.createInventory(createDto); }

  @Get('inventory/all')
  findAllInventory() { return this.rmService.findAllInventory(); }

  @Patch('inventory/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  updateInventory(@Param('id') id: string, @Body() updateDto: UpdateRawMaterialInventoryDto) { return this.rmService.updateInventory(id, updateDto); }

  @Delete('inventory/:id')
  removeInventory(@Param('id') id: string) { return this.rmService.removeInventory(id); }

  // --- Batch Endpoints ---

  @Post('batches')
  @ApiOperation({ summary: 'Add a new batch to inventory' })
  @UsePipes(new ValidationPipe({ transform: true }))
  addBatch(@Body() createDto: CreateRawMaterialBatchDto) { return this.rmService.addBatch(createDto); }

  @Get('batches/all')
  findAllBatches() { return this.rmService.findAllBatches(); }

  @Get('inventory/:inventoryId/batches')
  findBatchesByInventory(@Param('inventoryId') inventoryId: string) { return this.rmService.findBatchesByInventory(inventoryId); }

  @Patch('batches/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  updateBatch(@Param('id') id: string, @Body() updateDto: UpdateRawMaterialBatchDto) { return this.rmService.updateBatch(id, updateDto); }

  @Delete('batches/:id')
  removeBatch(@Param('id') id: string) { return this.rmService.removeBatch(id); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.rmService.findOne(id); }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateDto: UpdateRawMaterialDto) { return this.rmService.update(id, updateDto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.rmService.remove(id); }
}
