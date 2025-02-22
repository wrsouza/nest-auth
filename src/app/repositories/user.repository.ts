import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';
import { Prisma, Role, User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(where?: Prisma.UserWhereInput): Promise<User[]> {
    return this.prisma.user.findMany({ where });
  }

  async findOne(
    where: Prisma.UserWhereUniqueInput,
  ): Promise<(User & { roles: Role[] }) | null> {
    return this.prisma.user.findUnique({ where, include: { roles: true } });
  }

  async createOne(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async updateOne(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    return this.prisma.user.update({ where, data });
  }

  async deleteOne(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({ where });
  }

  async disconectRoles(
    where: Prisma.UserWhereUniqueInput,
    roles: Role[],
  ): Promise<User> {
    return this.prisma.user.update({
      where,
      data: {
        roles: {
          disconnect: roles.map((role) => ({ id: role.id })),
        },
      },
      include: { roles: true },
    });
  }

  async connectRoles(
    where: Prisma.UserWhereUniqueInput,
    roles: string[],
  ): Promise<User & { roles: Role[] }> {
    return this.prisma.user.update({
      where,
      data: {
        roles: {
          connect: roles.map((role) => ({ id: role })),
        },
      },
      include: { roles: true },
    });
  }
}
