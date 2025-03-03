import { PrismaService } from '../../../src/config';

export const createDefaultPermission = async (
  prisma: PrismaService,
  fields = {},
) => {
  const permission = await prisma.role.create({
    data: {
      name: 'permissions:create',
      description: 'permission description',
      ...fields,
    },
  });
  return { permission };
};
