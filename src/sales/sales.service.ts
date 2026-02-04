import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { order_status } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async createOrder(createDto: CreateSalesOrderDto) {
    return await this.prisma.$transaction(async (tx) => {
      // Calculate total if not provided
      let totalAmount = createDto.totalAmount || 0;
      if (!createDto.totalAmount && createDto.items?.length) {
        totalAmount = createDto.items.reduce((sum, item) => sum + item.netAmount, 0);
      }

      // Create order
      const order = await tx.sales_orders.create({
        data: {
          order_date: new Date(createDto.orderDate),
          delivery_date: createDto.deliveryDate ? new Date(createDto.deliveryDate) : null,
          customer_id: createDto.customerId,
          status: (createDto.status as order_status) || 'Draft',
          total_amount: totalAmount,
          created_by: createDto.createdBy,
        },
      });

      // Create order items
      if (createDto.items?.length) {
        await tx.sales_order_items.createMany({
          data: createDto.items.map(item => ({
            sales_order_id: order.id,
            item_id: item.itemId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            discount: item.discount || 0,
            tax: item.tax || 0,
            net_amount: item.netAmount,
            batch_number: item.batchNumber,
          })),
        });
      }

      const items = await tx.sales_order_items.findMany({ where: { sales_order_id: order.id } });
      return { ...order, items };
    });
  }

  async findAllOrders() {
    return this.prisma.sales_orders.findMany({
      orderBy: { created_at: 'desc' },
      include: { customers: true },
    });
  }

  async findOneOrder(id: string) {
    const order = await this.prisma.sales_orders.findUnique({
      where: { id },
      include: { sales_order_items: true, customers: true, dispatches: true },
    });
    if (!order) throw new NotFoundException(`Sales Order ${id} not found`);
    return order;
  }

  async updateOrder(id: string, updateDto: UpdateSalesOrderDto) {
    await this.findOneOrder(id);
    return this.prisma.sales_orders.update({
      where: { id },
      data: {
        order_date: updateDto.orderDate ? new Date(updateDto.orderDate) : undefined,
        delivery_date: updateDto.deliveryDate ? new Date(updateDto.deliveryDate) : undefined,
        status: updateDto.status as order_status,
        total_amount: updateDto.totalAmount,
        updated_at: new Date(),
      },
    });
  }

  async removeOrder(id: string) {
    const order = await this.findOneOrder(id);
    await this.prisma.trash.create({
      data: { original_table: 'sales_orders', original_id: id, data: order },
    });
    await this.prisma.sales_order_items.deleteMany({ where: { sales_order_id: id } });
    await this.prisma.sales_orders.delete({ where: { id } });
    return { message: 'Sales Order moved to trash', id };
  }
}
