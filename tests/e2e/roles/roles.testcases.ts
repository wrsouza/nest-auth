import { PrismaService } from '../../../src/config';

export const defaultRole = {
  name: 'supervisor',
  description: 'role description',
};

export const createDefaultRoleWithoutPermission = async (
  prisma: PrismaService,
  fields = {},
) => {
  const role = await prisma.role.create({
    data: {
      ...defaultRole,
      ...fields,
    },
  });
  return { role };
};

export const createDefaultRoleWithPermission = async (
  prisma: PrismaService,
  permissionName: string,
  fields = {},
) => {
  const role = await prisma.role.create({
    data: {
      ...defaultRole,
      ...fields,
      permissions: {
        create: {
          name: permissionName,
          description: 'permission description',
        },
      },
    },
    include: {
      permissions: true,
    },
  });
  return { role };
};
