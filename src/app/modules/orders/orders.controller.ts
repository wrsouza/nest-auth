import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderCreateDto } from './dtos';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrderResponseDto } from './dtos/orders-reponse.dto';
import { AuthGuard } from '../../../common';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a permission' })
  @ApiResponse({ status: 201, type: OrderResponseDto })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async create(@Body() data: OrderCreateDto): Promise<OrderResponseDto> {
    return this.service.createOne(data);
  }
}
