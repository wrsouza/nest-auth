import { JwtService } from '@nestjs/jwt';
import { BcryptService } from '../../../src/common';
import { PrismaService } from '../../../src/config';

export const defaultAuthenticateUser = {
  name: 'User Authenticated',
  email: 'user@domain.com',
  password: 'example',
  isActive: true,
  isAdmin: false,
};

export const defaultUser = {
  name: 'John Doe',
  email: 'john.doe@domain.com',
  password: 'example',
  isActive: true,
  isAdmin: false,
};

export const getAuthenticatedUserWithoutRoles = async (
  prisma: PrismaService,
  bcrypt: BcryptService,
  jwt: JwtService,
  fields = {},
) => {
  const authenticatedUser = await prisma.user.create({
    data: {
      ...defaultAuthenticateUser,
      password: bcrypt.hash(defaultAuthenticateUser.password),
      ...fields,
    },
  });
  const payload = { sub: authenticatedUser.id, email: authenticatedUser.email };
  const accessToken = await jwt.signAsync(payload);
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  return { headers, authenticatedUser };
};

export const getAuthenticatedUserWithRoles = async (
  prisma: PrismaService,
  bcrypt: BcryptService,
  jwt: JwtService,
  permissionName: string,
  fields = {},
) => {
  const authenticatedUser = await prisma.user.create({
    data: {
      ...defaultAuthenticateUser,
      password: bcrypt.hash(defaultAuthenticateUser.password),
      ...fields,
      roles: {
        create: {
          name: 'authenticated role',
          description: 'role description',
          permissions: {
            create: {
              name: permissionName,
              description: 'permission description',
            },
          },
        },
      },
    },
    include: {
      roles: {
        include: {
          permissions: true,
        },
      },
    },
  });
  const payload = { sub: authenticatedUser.id, email: authenticatedUser.email };
  const accessToken = await jwt.signAsync(payload);
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  return { headers, authenticatedUser };
};

export const createDefaultUserWithoutRole = async (
  prisma: PrismaService,
  bcrypt: BcryptService,
) => {
  const userCreated = await prisma.user.create({
    data: {
      ...defaultUser,
      password: bcrypt.hash(defaultUser.password),
    },
  });
  return { userCreated };
};

export const createDefaultUserWithRole = async (
  prisma: PrismaService,
  bcrypt: BcryptService,
  permissionName: string,
) => {
  const userCreated = await prisma.user.create({
    data: {
      ...defaultUser,
      password: bcrypt.hash(defaultUser.password),
      roles: {
        create: {
          name: 'default role',
          description: 'role description',
          permissions: {
            create: {
              name: permissionName,
              description: 'permission description',
            },
          },
        },
      },
    },
  });
  return { userCreated };
};
