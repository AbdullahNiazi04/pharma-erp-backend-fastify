import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { customer_type } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateCustomerDto) {
    return this.prisma.customers.create({
      data: {
        name: createDto.name,
        type: createDto.type as customer_type,
        contact_person: createDto.contactPerson,
        phone: createDto.phone,
        email: createDto.email,
        billing_address: createDto.billingAddress,
        shipping_address: createDto.shippingAddress,
        tax_id: createDto.taxId,
        status: 'Active',
      },
    });
  }

  async findAll() {
    return this.prisma.customers.findMany({ orderBy: { created_at: 'desc' } });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customers.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }

  async update(id: string, updateDto: UpdateCustomerDto) {
    await this.findOne(id);
    return this.prisma.customers.update({
      where: { id },
      data: {
        name: updateDto.name,
        type: updateDto.type as customer_type,
        contact_person: updateDto.contactPerson,
        phone: updateDto.phone,
        email: updateDto.email,
        billing_address: updateDto.billingAddress,
        shipping_address: updateDto.shippingAddress,
        tax_id: updateDto.taxId,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string) {
    const customer = await this.findOne(id);
    await this.prisma.trash.create({
      data: { original_table: 'customers', original_id: id, data: customer },
    });
    await this.prisma.customers.delete({ where: { id } });
    return { message: 'Customer moved to trash', id };
  }
}
