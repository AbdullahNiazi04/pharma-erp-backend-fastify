import { Controller, Get, Post, Body, Param, Delete, UsePipes, ValidationPipe, Patch } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by id' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a payment' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    try {
      return await this.paymentsService.update(id, updatePaymentDto);
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payment' })
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
