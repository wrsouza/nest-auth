import { BadRequestException, Injectable } from '@nestjs/common';
import { PermissionRepository } from '../../repositories/permission.repository';
import {
  PermissionCreateDto,
  PermissionResponse,
  PermissionUpdateDto,
} from './dtos';
import { Permission } from '@prisma/client';
import { ResponseErrorEnum } from '../../../common/enums/response-error.enum';

@Injectable()
export class PermissionsService {
  constructor(private readonly repository: PermissionRepository) {}

  async findAll(): Promise<PermissionResponse[]> {
    const result = await this.repository.findAll();
    return result.map(
      (permission: Permission) => new PermissionResponse(permission),
    );
  }

  async createOne(data: PermissionCreateDto): Promise<PermissionResponse> {
    const permission = await this.repository.findOne({ name: data.name });
    if (permission) {
      throw new BadRequestException(
        ResponseErrorEnum.PERMISSION_ALREADY_EXISTS,
      );
    }
    const result = await this.repository.createOne(data);
    return new PermissionResponse(result);
  }

  async findOne(id: string): Promise<PermissionResponse> {
    const result = await this.repository.findOne({ id });
    if (!result) {
      throw new BadRequestException(ResponseErrorEnum.PERMISSION_NOT_FOUND);
    }
    return new PermissionResponse(result);
  }

  async updateOne(
    id: string,
    data: PermissionUpdateDto,
  ): Promise<PermissionResponse> {
    const permission = await this.repository.findOne({ id });
    if (!permission) {
      throw new BadRequestException(ResponseErrorEnum.PERMISSION_NOT_FOUND);
    }
    const result = await this.repository.updateOne({ id }, data);
    return new PermissionResponse(result);
  }

  async deleteOne(id: string): Promise<void> {
    const permission = await this.repository.findOne({ id });
    if (!permission) {
      throw new BadRequestException(ResponseErrorEnum.PERMISSION_NOT_FOUND);
    }
    await this.repository.deleteOne({ id });
  }
}
