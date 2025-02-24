import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { RoleCreateDto, RoleResponseDto, RoleUpdateDto } from './dtos';
import { PermissionRepository, RoleRepository } from '../../repositories';
import { ResponseErrorEnum } from '../../../common/enums/response-error.enum';

@Injectable()
export class RolesService {
  constructor(
    private readonly repository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async findAll(): Promise<RoleResponseDto[]> {
    const result = await this.repository.findAll();
    return result.map((role) => new RoleResponseDto(role));
  }

  async createOne(data: RoleCreateDto): Promise<RoleResponseDto> {
    const role = await this.repository.findOne({ name: data.name });
    if (role) {
      throw new BadRequestException(ResponseErrorEnum.ROLE_ALREADY_EXISTS);
    }
    const result = await this.repository.createOne(data);
    return new RoleResponseDto(result);
  }

  async findOne(id: string): Promise<RoleResponseDto> {
    const result = await this.repository.findOne({ id });
    if (!result) {
      throw new NotFoundException(ResponseErrorEnum.ROLE_NOT_FOUND);
    }
    return new RoleResponseDto(result);
  }

  async updateOne(id: string, data: RoleUpdateDto): Promise<RoleResponseDto> {
    const role = await this.repository.findOne({ id });
    if (!role) {
      throw new NotFoundException(ResponseErrorEnum.ROLE_NOT_FOUND);
    }
    const result = await this.repository.updateOne({ id }, data);
    return new RoleResponseDto(result);
  }

  async deleteOne(id: string): Promise<void> {
    const Role = await this.repository.findOne({ id });
    if (!Role) {
      throw new NotFoundException(ResponseErrorEnum.ROLE_NOT_FOUND);
    }
    await this.repository.deleteOne({ id });
  }

  async updatePermissions(
    id: string,
    permissions: string[],
  ): Promise<RoleResponseDto> {
    const role = await this.repository.findOne({ id });
    if (!role) {
      throw new BadRequestException(ResponseErrorEnum.ROLE_NOT_FOUND);
    }

    const permissionsResult = await this.permissionRepository.findAll({
      id: { in: permissions },
    });
    if (permissionsResult.length !== permissions.length) {
      throw new BadRequestException(ResponseErrorEnum.ROLE_NOT_FOUND);
    }

    if (role.permissions.length) {
      await this.repository.disconectPermissions({ id }, role.permissions);
    }

    if (permissions.length) {
      const result = await this.repository.connectPermissions(
        { id },
        permissions,
      );
      return new RoleResponseDto(result);
    }

    role.permissions = [];
    return new RoleResponseDto(role);
  }
}
