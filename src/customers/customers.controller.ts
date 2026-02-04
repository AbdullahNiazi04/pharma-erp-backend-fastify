import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createDto: CreateCustomerDto) { return this.customersService.create(createDto); }

  @Get()
  findAll() { return this.customersService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.customersService.findOne(id); }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateDto: UpdateCustomerDto) { return this.customersService.update(id, updateDto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.customersService.remove(id); }
}
