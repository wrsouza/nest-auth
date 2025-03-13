import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderRepository, UserRepository } from '../../repositories';
import { OrdersMapper } from './orders.mapper';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrderRepository, OrdersMapper, UserRepository],
})
export class OrdersModule {}
