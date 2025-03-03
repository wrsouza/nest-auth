import { PrismaService } from '../../../src/config';

export const defaultPermission = {
  name: 'users:list',
  description: 'permission description',
};

export const createDefaultPermission = async (
  prisma: PrismaService,
  fields = {},
) => {
  const permission = await prisma.permission.create({
    data: {
      ...defaultPermission,
      ...fields,
    },
  });
  return { permission };
};
