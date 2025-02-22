import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';
import { Permission, Prisma } from '@prisma/client';

@Injectable()
export class PermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(where?: Prisma.PermissionWhereInput): Promise<Permission[]> {
    return this.prisma.permission.findMany({ where });
  }

  async findOne(
    where: Prisma.PermissionWhereUniqueInput,
  ): Promise<Permission | null> {
    return this.prisma.permission.findUnique({ where });
  }

  async createOne(data: Prisma.PermissionCreateInput): Promise<Permission> {
    return this.prisma.permission.create({ data });
  }

  async updateOne(
    where: Prisma.PermissionWhereUniqueInput,
    data: Prisma.PermissionUpdateInput,
  ): Promise<Permission> {
    return this.prisma.permission.update({ where, data });
  }

  async deleteOne(
    where: Prisma.PermissionWhereUniqueInput,
  ): Promise<Permission> {
    return this.prisma.permission.delete({ where });
  }
}
