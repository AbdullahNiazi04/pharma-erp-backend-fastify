import { Controller, Get, Post, Body, Param, Delete, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProcurementOptionsService } from './procurement-options.service';
import { CreateProcurementOptionDto } from './dto/create-procurement-option.dto';

@ApiTags('procurement-options')
@Controller('procurement-options')
export class ProcurementOptionsController {
  constructor(private readonly optionsService: ProcurementOptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new procurement option' })
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createDto: CreateProcurementOptionDto) {
    return this.optionsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all procurement options, optionally filtered by type' })
  @ApiQuery({ name: 'type', required: false })
  findAll(@Query('type') type?: string) {
    if (type) {
      return this.optionsService.findByType(type);
    }
    return this.optionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a procurement option by ID' })
  findOne(@Param('id') id: string) {
    return this.optionsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a procurement option' })
  remove(@Param('id') id: string) {
    return this.optionsService.remove(id);
  }
}
