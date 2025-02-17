import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';
import { Role, Prisma } from '@prisma/client';

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  async findOne(where: Prisma.RoleWhereUniqueInput): Promise<Role | null> {
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
