import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config';
import { Order, OrderItem, Prisma } from '@prisma/client';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOne(
    data: Prisma.OrderCreateInput,
  ): Promise<Order & { items: OrderItem[] }> {
    return this.prisma.order.create({
      data,
      include: {
        items: true,
      },
    });
  }
}
