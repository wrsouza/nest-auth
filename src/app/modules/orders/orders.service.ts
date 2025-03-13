import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderRepository, UserRepository } from '../../repositories';
import { OrderCreateDto } from './dtos';
import { ResponseErrorEnum } from '../../../common';
import { OrdersMapper } from './orders.mapper';
import { OrderResponseDto } from './dtos/orders-reponse.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly repository: OrderRepository,
    private readonly userRepository: UserRepository,
    private readonly mapper: OrdersMapper,
  ) {}

  async createOne(data: OrderCreateDto) {
    // consultar userId se existe
    await this.findUserById(data.userId);

    // realiza o mapper dos dados para o cadastro
    const dataMapper = this.mapper.createWithItems(data);

    // cadastra o pedido com os itens no banco
    const order = await this.repository.createOne(dataMapper);

    // retorna os dados mapeados
    return new OrderResponseDto(order);
  }

  async findUserById(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ id });
    if (!user) {
      throw new BadRequestException(ResponseErrorEnum.USER_NOT_FOUND);
    }
  }
}
