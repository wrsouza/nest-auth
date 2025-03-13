import { Order, OrderItem } from '@prisma/client';

export class OrderItemResponseDto {
  id: string;
  productId: string;
  productSku: string;
  quantity: number;
  price: number;
  createdAt: Date;
}

export class OrderResponseDto {
  id: string;
  userId: string;
  total: number;
  paymentType: string;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemResponseDto[];

  constructor(data: Order & { items: OrderItem[] }) {
    this.id = data.id;
    this.userId = data.userId;
    this.total = Number(data.total.toString());
    this.paymentType = data.paymentType;
    this.paymentStatus = data.paymentStatus;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.items = data.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productSku: item.productSku,
      quantity: item.quantity,
      price: Number(item.price.toString()),
      createdAt: item.createdAt,
    }));
  }
}
