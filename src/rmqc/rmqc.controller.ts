import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { RmqcService } from './rmqc.service';
import { CreateRmqcDto } from './dto/create-rmqc.dto';
import { UpdateRmqcDto } from './dto/update-rmqc.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('RMQC')
@Controller('rmqc')
export class RmqcController {
  constructor(private readonly rmqcService: RmqcService) {}

  @Post()
  @ApiOperation({ summary: 'Create new RMQC inspection' })
  create(@Body() createRmqcDto: CreateRmqcDto) {
    return this.rmqcService.create(createRmqcDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all inspections' })
  findAll() {
    return this.rmqcService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inspection details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rmqcService.findOne(id);
  }


  @Post(':id/pass')
  @ApiOperation({ summary: 'Mark inspection as Passed' })
  pass(@Param('id', ParseUUIDPipe) id: string) {
    return this.rmqcService.passInspection(id);
  }

  @Post(':id/fail')
  @ApiOperation({ summary: 'Mark inspection as Failed' })
  fail(@Param('id', ParseUUIDPipe) id: string) {
    return this.rmqcService.failInspection(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete RMQC inspection' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rmqcService.remove(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update RMQC inspection' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateRmqcDto: UpdateRmqcDto) {
    return this.rmqcService.update(id, updateRmqcDto);
  }
}
