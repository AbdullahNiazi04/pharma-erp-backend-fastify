import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { QcInspectorsService } from './qc-inspectors.service';
import { CreateQcInspectorDto } from './dto/create-qc-inspector.dto';
import { UpdateQcInspectorDto } from './dto/update-qc-inspector.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('qc-inspectors')
@Controller('qc-inspectors')
export class QcInspectorsController {
  constructor(private readonly qcInspectorsService: QcInspectorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new QC Inspector' })
  create(@Body() createQcInspectorDto: CreateQcInspectorDto) {
    return this.qcInspectorsService.create(createQcInspectorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all QC Inspectors' })
  findAll() {
    return this.qcInspectorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific QC Inspector' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.qcInspectorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a QC Inspector' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateQcInspectorDto: UpdateQcInspectorDto) {
    return this.qcInspectorsService.update(id, updateQcInspectorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a QC Inspector' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.qcInspectorsService.remove(id);
  }
}
