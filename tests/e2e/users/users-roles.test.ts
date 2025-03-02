import supertest from 'supertest';
import { BaseSetup } from '../base-setup';
import { PrismaService } from '../../../src/config';
import { JwtService } from '@nestjs/jwt';
import { BcryptService } from '../../../src/common';

describe('Users Roles Api', () => {
  const baseSetup: BaseSetup = new BaseSetup();
  let request: supertest.SuperAgentTest;
  let prisma: PrismaService;
  let bcrypt: BcryptService;
  let jwt: JwtService;

  const defaultUser = {
    name: 'User Authenticated',
    email: 'user@domain.com',
    password: 'example',
    isActive: true,
    isAdmin: false,
  };

  beforeAll(async () => {
    await baseSetup.beforeAll();
    request = baseSetup.Request;
    prisma = baseSetup.Prisma;
    jwt = baseSetup.Jwt;
    bcrypt = baseSetup.Bcrypt;
  });

  afterEach(() => baseSetup.afterEach());
  afterAll(() => baseSetup.afterAll());

  describe(`/users/:id/roles (PUT)`, () => {
    it('should return status code 403 when not send authorization code', async () => {
      const id = '19acb732-0afd-49d2-9db7-a43ae9120479';
      const result = await request.put(`/api/users/${id}/roles`);
      expect(result.statusCode).toBe(403);
      expect(result.body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403,
      });
    });

    it('should return status code 403 when user not have permission', async () => {
      const user = await prisma.user.create({
        data: {
          ...defaultUser,
          password: bcrypt.hash('example'),
        },
      });
      const payload = { sub: user.id, email: user.email };
      const accessToken = await jwt.signAsync(payload);
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const result = await request
        .put(`/api/users/${user.id}/roles`)
        .set(headers);
      expect(result.statusCode).toBe(403);
      expect(result.body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403,
      });
    });

    it('should return status code 400 when send missing data', async () => {
      const user = await prisma.user.create({
        data: {
          ...defaultUser,
          password: bcrypt.hash('example'),
          roles: {
            create: {
              name: 'users role',
              description: 'users role',
              permissions: {
                create: {
                  name: 'users:roles',
                  description: 'roles users',
                },
              },
            },
          },
        },
      });
      const payload = { sub: user.id, email: user.email };
      const accessToken = await jwt.signAsync(payload);
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const body = {};
      const result = await request
        .put(`/api/users/${user.id}/roles`)
        .set(headers)
        .send(body);
      expect(result.statusCode).toBe(400);
      expect(result.body).toEqual({
        error: 'Bad Request',
        message: ['roles must be an array'],
        statusCode: 400,
      });
    });

    it('should return status code 404 when user not found', async () => {
      const user = await prisma.user.create({
        data: {
          ...defaultUser,
          password: bcrypt.hash('example'),
          roles: {
            create: {
              name: 'users role',
              description: 'users role',
              permissions: {
                create: {
                  name: 'users:roles',
                  description: 'roles users',
                },
              },
            },
          },
        },
      });
      const payload = { sub: user.id, email: user.email };
      const accessToken = await jwt.signAsync(payload);
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const id = '19acb732-0afd-49d2-9db7-a43ae9120479';
      const body = {
        roles: [],
      };
      const result = await request
        .put(`/api/users/${id}/roles`)
        .set(headers)
        .send(body);
      expect(result.statusCode).toBe(404);
      expect(result.body).toEqual({
        error: 'Not Found',
        message: 'User not found',
        statusCode: 404,
      });
    });

    it('should return status code 404 when role not found', async () => {
      const user = await prisma.user.create({
        data: {
          ...defaultUser,
          password: bcrypt.hash('example'),
          roles: {
            create: {
              name: 'users role',
              description: 'users role',
              permissions: {
                create: {
                  name: 'users:roles',
                  description: 'roles users',
                },
              },
            },
          },
        },
      });
      const payload = { sub: user.id, email: user.email };
      const accessToken = await jwt.signAsync(payload);
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const id = user.id;
      const body = {
        roles: ['19acb732-0afd-49d2-9db7-a43ae9120479'],
      };
      const result = await request
        .put(`/api/users/${id}/roles`)
        .set(headers)
        .send(body);
      expect(result.statusCode).toBe(404);
      expect(result.body).toEqual({
        error: 'Not Found',
        message: 'Role not found',
        statusCode: 404,
      });
    });

    it('should return status code 200 and remove all user roles', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'John Doe',
          email: 'john.doe@domain.com',
          password: bcrypt.hash('example'),
          isActive: true,
          isAdmin: false,
          roles: {
            create: {
              name: 'default role',
              description: 'default role',
              permissions: {
                create: {
                  name: 'users:list',
                  description: 'list users',
                },
              },
            },
          },
        },
      });
      const authenticatedUser = await prisma.user.create({
        data: {
          ...defaultUser,
          password: bcrypt.hash('example'),
          roles: {
            create: {
              name: 'users role',
              description: 'users role',
              permissions: {
                create: {
                  name: 'users:roles',
                  description: 'roles users',
                },
              },
            },
          },
        },
      });
      const payload = {
        sub: authenticatedUser.id,
        email: authenticatedUser.email,
      };
      const accessToken = await jwt.signAsync(payload);
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const id = user.id;
      const body = {
        roles: [],
      };
      const result = await request
        .put(`/api/users/${id}/roles`)
        .set(headers)
        .send(body);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(
        expect.objectContaining({
          id: user.id,
          name: user.name,
          email: user.email,
          isActive: true,
          isAdmin: false,
          createdAt: user.createdAt.toISOString(),
          roles: [],
        }),
      );

      const checkUser = await prisma.user.findUnique({
        where: { id },
        include: { roles: true },
      });
      expect(checkUser?.roles).toEqual([]);
    });

    it('should return status code 200 and connect user to role', async () => {
      const role = await prisma.role.create({
        data: {
          name: 'role',
          description: 'role description',
          permissions: {
            create: {
              name: 'users:list',
              description: 'list users',
            },
          },
        },
      });
      const user = await prisma.user.create({
        data: {
          name: 'John Doe',
          email: 'john.doe@domain.com',
          password: bcrypt.hash('example'),
          isActive: true,
          isAdmin: false,
        },
      });
      const authenticatedUser = await prisma.user.create({
        data: {
          ...defaultUser,
          password: bcrypt.hash('example'),
          roles: {
            create: {
              name: 'users role',
              description: 'users role',
              permissions: {
                create: {
                  name: 'users:roles',
                  description: 'roles users',
                },
              },
            },
          },
        },
      });
      const payload = {
        sub: authenticatedUser.id,
        email: authenticatedUser.email,
      };
      const accessToken = await jwt.signAsync(payload);
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const id = user.id;
      const body = {
        roles: [role.id],
      };
      const result = await request
        .put(`/api/users/${id}/roles`)
        .set(headers)
        .send(body);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(
        expect.objectContaining({
          id: user.id,
          name: user.name,
          email: user.email,
          isActive: true,
          isAdmin: false,
          createdAt: user.createdAt.toISOString(),
          roles: [role.id],
        }),
      );

      const checkUser = await prisma.user.findUnique({
        where: { id },
        include: { roles: true },
      });
      expect(checkUser?.roles).toEqual([role]);
    });

    it('should return status code 200 and disconnect user from old roles and connect user to a new role', async () => {
      const role = await prisma.role.create({
        data: {
          name: 'role',
          description: 'role description',
          permissions: {
            create: {
              name: 'users:list',
              description: 'list users',
            },
          },
        },
      });
      const user = await prisma.user.create({
        data: {
          name: 'John Doe',
          email: 'john.doe@domain.com',
          password: bcrypt.hash('example'),
          isActive: true,
          isAdmin: false,
          roles: {
            create: {
              name: 'default role',
              description: 'default role',
              permissions: {
                create: {
                  name: 'users:read',
                  description: 'read users',
                },
              },
            },
          },
        },
      });
      const authenticatedUser = await prisma.user.create({
        data: {
          ...defaultUser,
          password: bcrypt.hash('example'),
          roles: {
            create: {
              name: 'users role',
              description: 'users role',
              permissions: {
                create: {
                  name: 'users:roles',
                  description: 'roles users',
                },
              },
            },
          },
        },
      });
      const payload = {
        sub: authenticatedUser.id,
        email: authenticatedUser.email,
      };
      const accessToken = await jwt.signAsync(payload);
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const id = user.id;
      const body = {
        roles: [role.id],
      };
      const result = await request
        .put(`/api/users/${id}/roles`)
        .set(headers)
        .send(body);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(
        expect.objectContaining({
          id: user.id,
          name: user.name,
          email: user.email,
          isActive: true,
          isAdmin: false,
          createdAt: user.createdAt.toISOString(),
          roles: [role.id],
        }),
      );

      const checkUser = await prisma.user.findUnique({
        where: { id },
        include: { roles: true },
      });
      expect(checkUser?.roles).toEqual([role]);
    });
  });
});
