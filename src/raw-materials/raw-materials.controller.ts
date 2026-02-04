import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RawMaterialsService } from './raw-materials.service';
import { CreateRawMaterialDto } from './dto/create-raw-material.dto';
import { UpdateRawMaterialDto } from './dto/update-raw-material.dto';

@ApiTags('raw-materials')
@Controller('raw-materials')
export class RawMaterialsController {
  constructor(private readonly rmService: RawMaterialsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createDto: CreateRawMaterialDto) { return this.rmService.create(createDto); }

  @Get()
  findAll() { return this.rmService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.rmService.findOne(id); }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateDto: UpdateRawMaterialDto) { return this.rmService.update(id, updateDto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.rmService.remove(id); }
}
