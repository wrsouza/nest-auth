import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoleRepository, UserRepository } from '../../repositories';
import { UserCreateDto, UserUpdateDto, UserResponseDto } from './dtos';
import { BcryptService } from '../../../common/bcrypt/bcrypt.service';
import { ResponseErrorEnum } from '../../../common/enums/response-error.enum';
import { Role, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly bcrypt: BcryptService,
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    const result: User[] = await this.repository.findAll();
    return result.map((user: User) => new UserResponseDto(user));
  }

  async createOne(data: UserCreateDto): Promise<UserResponseDto> {
    await this.validateEmailExists(data.email);

    data.password = this.bcrypt.hash(data.password);
    const result = await this.repository.createOne(data);

    return new UserResponseDto(result);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.validateUserId(id);
    return new UserResponseDto(user);
  }

  async updateOne(id: string, data: UserUpdateDto): Promise<UserResponseDto> {
    await this.validateUserId(id);

    if (data.email) {
      await this.validateEmailExists(data.email, id);
    }

    if (data.password) {
      data.password = this.bcrypt.hash(data.password);
    }

    const result = await this.repository.updateOne({ id }, data);
    return new UserResponseDto(result);
  }

  async deleteOne(id: string): Promise<void> {
    await this.validateUserId(id);
    await this.repository.deleteOne({ id });
  }

  async updateRoles(id: string, roles: string[]): Promise<UserResponseDto> {
    const user = await this.validateUserId(id);
    await this.validateRoles(roles);
    await this.disconnectRoles(user);

    if (roles.length) {
      const result = await this.repository.connectRoles({ id }, roles);
      return new UserResponseDto(result);
    }

    user.roles = [];
    return new UserResponseDto(user);
  }

  private async validateUserId(id: string): Promise<User & { roles: Role[] }> {
    const user = await this.repository.findOne({ id });
    if (!user) {
      throw new NotFoundException(ResponseErrorEnum.USER_NOT_FOUND);
    }
    return user;
  }

  private async validateEmailExists(email: string, id?: string): Promise<void> {
    let checkNotId = {};
    if (id) {
      checkNotId = {
        NOT: {
          id,
        },
      };
    }
    const userExists = await this.repository.findOne({
      email: email,
      ...checkNotId,
    });
    if (userExists) {
      throw new BadRequestException(ResponseErrorEnum.USER_ALREADY_EXISTS);
    }
  }

  private async validateRoles(roles: string[]) {
    const rolesResult = await this.roleRepository.findAll({
      id: { in: roles },
    });
    if (rolesResult.length !== roles.length) {
      throw new NotFoundException(ResponseErrorEnum.ROLE_NOT_FOUND);
    }
  }

  private async disconnectRoles(user: User & { roles: Role[] }): Promise<void> {
    if (user.roles.length) {
      await this.repository.disconectRoles({ id: user.id }, user.roles);
    }
  }
}
