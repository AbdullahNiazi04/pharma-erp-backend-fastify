import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FinishedGoodsService } from './finished-goods.service';
import { CreateFinishedGoodDto } from './dto/create-finished-good.dto';
import { UpdateFinishedGoodDto } from './dto/update-finished-good.dto';

@ApiTags('finished-goods')
@Controller('finished-goods')
export class FinishedGoodsController {
  constructor(private readonly fgService: FinishedGoodsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createDto: CreateFinishedGoodDto) { return this.fgService.create(createDto); }

  @Get()
  findAll() { return this.fgService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.fgService.findOne(id); }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateDto: UpdateFinishedGoodDto) { return this.fgService.update(id, updateDto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.fgService.remove(id); }
}
