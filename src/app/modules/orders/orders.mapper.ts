import { Injectable } from '@nestjs/common';
import { OrderCreateDto } from './dtos';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersMapper {
  createWithItems(data: OrderCreateDto): Prisma.OrderCreateInput {
    return {
      total: data.total,
      paymentType: data.paymentType,
      paymentStatus: data.paymentStatus,
      user: {
        connect: { id: data.userId },
      },
      items: {
        createMany: {
          data: data.items.map((item) => ({
            productId: item.productId,
            productSku: item.productSku,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    };
  }
}
