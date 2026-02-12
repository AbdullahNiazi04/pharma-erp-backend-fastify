import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PurchaseRequisitionsService } from './purchase-requisitions.service';
import { CreatePurchaseRequisitionDto } from './dto/create-purchase-requisition.dto';
import { UpdatePurchaseRequisitionDto } from './dto/update-purchase-requisition.dto';

@ApiTags('purchase-requisitions')
@Controller('purchase-requisitions')
export class PurchaseRequisitionsController {
  constructor(private readonly prService: PurchaseRequisitionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new purchase requisition' })
  @ApiResponse({ status: 201, description: 'PR created successfully' })
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createDto: CreatePurchaseRequisitionDto) {
    return this.prService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchase requisitions' })
  @ApiResponse({ status: 200, description: 'List of all PRs' })
  findAll() {
    return this.prService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Get PRs available for PO creation (Approved & not linked to any PO)' })
  @ApiResponse({ status: 200, description: 'List of available PRs' })
  findAvailableForPO() {
    return this.prService.findAvailableForPO();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a purchase requisition by ID' })
  @ApiResponse({ status: 200, description: 'PR found with items' })
  @ApiResponse({ status: 404, description: 'PR not found' })
  findOne(@Param('id') id: string) {
    return this.prService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a purchase requisition' })
  @ApiResponse({ status: 200, description: 'PR updated successfully' })
  @ApiResponse({ status: 404, description: 'PR not found' })
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateDto: UpdatePurchaseRequisitionDto) {
    return this.prService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a purchase requisition (soft delete)' })
  @ApiResponse({ status: 200, description: 'PR moved to trash' })
  @ApiResponse({ status: 400, description: 'Cannot delete - linked to PO' })
  @ApiResponse({ status: 404, description: 'PR not found' })
  remove(@Param('id') id: string) {
    return this.prService.remove(id);
  }
}
