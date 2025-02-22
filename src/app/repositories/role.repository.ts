import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';
import { Role, Prisma, Permission } from '@prisma/client';

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(where?: Prisma.RoleWhereInput): Promise<Role[]> {
    return this.prisma.role.findMany({ where });
  }

  async findOne(
    where: Prisma.RoleWhereUniqueInput,
  ): Promise<(Role & { permissions: Permission[] }) | null> {
    return this.prisma.role.findUnique({
      where,
      include: { permissions: true },
    });
  }

  async createOne(data: Prisma.RoleCreateInput): Promise<Role> {
    return this.prisma.role.create({ data });
  }

  async updateOne(
    where: Prisma.RoleWhereUniqueInput,
    data: Prisma.RoleUpdateInput,
  ): Promise<Role> {
    return this.prisma.role.update({ where, data });
  }

  async deleteOne(where: Prisma.RoleWhereUniqueInput): Promise<Role> {
    return this.prisma.role.delete({ where });
  }
}
