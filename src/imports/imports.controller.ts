import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ImportsService } from './imports.service';
import { CreateImportOrderDto } from './dto/create-import-order.dto';
import { UpdateImportOrderDto } from './dto/update-import-order.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Imports')
@Controller('imports')
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new import order' })
  @ApiResponse({ status: 201, description: 'The import order has been successfully created.' })
  create(@Body() createImportOrderDto: CreateImportOrderDto) {
    return this.importsService.create(createImportOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all import orders' })
  @ApiResponse({ status: 200, description: 'Return all import orders.' })
  findAll() {
    return this.importsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get import order by id' })
  @ApiResponse({ status: 200, description: 'Return the import order.' })
  findOne(@Param('id') id: string) {
    return this.importsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update import order' })
  @ApiResponse({ status: 200, description: 'The import order has been successfully updated.' })
  update(@Param('id') id: string, @Body() updateImportOrderDto: UpdateImportOrderDto) {
    return this.importsService.update(id, updateImportOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete import order' })
  @ApiResponse({ status: 200, description: 'The import order has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.importsService.remove(id);
  }
}
