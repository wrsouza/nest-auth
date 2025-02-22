import { BadRequestException, Injectable } from '@nestjs/common';
import { RoleRepository, UserRepository } from '../../repositories';
import { UserCreateDto, UserUpdateDto, UserResponseDto } from './dtos';
import { BcryptService } from '../../../common/bcrypt/bcrypt.service';
import { ResponseErrorEnum } from '../../../common/enums/response-error.enum';
import { User } from '@prisma/client';

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
    const user = await this.repository.findOne({ email: data.email });
    if (user) {
      throw new BadRequestException(ResponseErrorEnum.USER_ALREADY_EXISTS);
    }

    data.password = this.bcrypt.hash(data.password);
    const result = await this.repository.createOne(data);

    return new UserResponseDto(result);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const result = await this.repository.findOne({ id });
    if (!result) {
      throw new BadRequestException(ResponseErrorEnum.USER_NOT_FOUND);
    }
    return new UserResponseDto(result);
  }

  async updateOne(id: string, data: UserUpdateDto): Promise<UserResponseDto> {
    const user = await this.repository.findOne({ id });
    if (!user) {
      throw new BadRequestException(ResponseErrorEnum.USER_NOT_FOUND);
    }

    if (data.password) {
      data.password = this.bcrypt.hash(data.password);
    }

    const result = await this.repository.updateOne({ id }, data);
    return new UserResponseDto(result);
  }

  async deleteOne(id: string): Promise<void> {
    const user = await this.repository.findOne({ id });
    if (!user) {
      throw new BadRequestException(ResponseErrorEnum.USER_NOT_FOUND);
    }

    await this.repository.deleteOne({ id });
  }

  async updateRoles(id: string, roles: string[]): Promise<UserResponseDto> {
    const user = await this.repository.findOne({ id });
    if (!user) {
      throw new BadRequestException(ResponseErrorEnum.USER_NOT_FOUND);
    }

    const rolesResult = await this.roleRepository.findAll({
      id: { in: roles },
    });
    if (rolesResult.length !== roles.length) {
      throw new BadRequestException(ResponseErrorEnum.ROLE_NOT_FOUND);
    }

    if (user.roles.length) {
      await this.repository.disconectRoles({ id }, user.roles);
    }

    if (roles.length) {
      const result = await this.repository.connectRoles({ id }, roles);
      return new UserResponseDto(result);
    }

    user.roles = [];
    return new UserResponseDto(user);
  }
}
