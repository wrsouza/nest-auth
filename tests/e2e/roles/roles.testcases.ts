import { PrismaService } from '../../../src/config';

export const createDefaultRoleWithPermission = async (
  prisma: PrismaService,
  permissionName: string,
) => {
  const role = await prisma.role.create({
    data: {
      name: 'role',
      description: 'role description',
      permissions: {
        create: {
          name: permissionName,
          description: 'permission description',
        },
      },
    },
  });
  return { role };
};
