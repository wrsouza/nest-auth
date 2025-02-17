import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { RoleCreateDto, RoleResponse, RoleUpdateDto } from './dtos';
import { RoleRepository } from '../../repositories';
import { ResponseErrorEnum } from '../../../common/enums/response-error.enum';

@Injectable()
export class RolesService {
  constructor(private readonly repository: RoleRepository) {}

  async findAll(): Promise<RoleResponse[]> {
    const result = await this.repository.findAll();
    return result.map((Role: Role) => new RoleResponse(Role));
  }

  async createOne(data: RoleCreateDto): Promise<RoleResponse> {
    const role = await this.repository.findOne({ name: data.name });
    if (role) {
      throw new BadRequestException(ResponseErrorEnum.ROLE_ALREADY_EXISTS);
    }
    const result = await this.repository.createOne(data);
    return new RoleResponse(result);
  }

  async findOne(id: string): Promise<RoleResponse> {
    const result = await this.repository.findOne({ id });
    if (!result) {
      throw new NotFoundException(ResponseErrorEnum.ROLE_NOT_FOUND);
    }
    return new RoleResponse(result);
  }

  async updateOne(id: string, data: RoleUpdateDto): Promise<RoleResponse> {
    const role = await this.repository.findOne({ id });
    if (!role) {
      throw new NotFoundException(ResponseErrorEnum.ROLE_NOT_FOUND);
    }
    const result = await this.repository.updateOne({ id }, data);
    return new RoleResponse(result);
  }

  async deleteOne(id: string): Promise<void> {
    const Role = await this.repository.findOne({ id });
    if (!Role) {
      throw new NotFoundException(ResponseErrorEnum.ROLE_NOT_FOUND);
    }
    await this.repository.deleteOne({ id });
  }
}
