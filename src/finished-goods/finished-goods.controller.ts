import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FinishedGoodsService } from './finished-goods.service';
import { CreateFinishedGoodDto } from './dto/create-finished-good.dto';
import { UpdateFinishedGoodDto } from './dto/update-finished-good.dto';
import { CreateFinishedGoodBatchDto } from './dto/create-finished-good-batch.dto';
import { UpdateFinishedGoodBatchDto } from './dto/update-finished-good-batch.dto';

@ApiTags('finished-goods')
@Controller('finished-goods')
export class FinishedGoodsController {
  constructor(private readonly fgService: FinishedGoodsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createDto: CreateFinishedGoodDto) { return this.fgService.create(createDto); }

  @Get()
  findAll() { return this.fgService.findAll(); }

  // --- Batch Endpoints ---

  @Post('batches')
  @ApiOperation({ summary: 'Add a new finished good batch' })
  @UsePipes(new ValidationPipe({ transform: true }))
  addBatch(@Body() createDto: CreateFinishedGoodBatchDto) { return this.fgService.addBatch(createDto); }

  @Get('batches/all')
  findAllBatches() { return this.fgService.findAllBatches(); }

  @Get(':itemId/batches')
  findBatchesByItem(@Param('itemId') itemId: string) { return this.fgService.findBatchesByItem(itemId); }

  @Patch('batches/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  updateBatch(@Param('id') id: string, @Body() updateDto: UpdateFinishedGoodBatchDto) { return this.fgService.updateBatch(id, updateDto); }

  @Delete('batches/:id')
  removeBatch(@Param('id') id: string) { return this.fgService.removeBatch(id); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.fgService.findOne(id); }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateDto: UpdateFinishedGoodDto) { return this.fgService.update(id, updateDto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.fgService.remove(id); }
}
