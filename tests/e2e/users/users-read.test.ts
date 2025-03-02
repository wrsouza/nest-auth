import supertest from 'supertest';
import { BaseSetup } from '../base-setup';
import { PrismaService } from '../../../src/config';
import { JwtService } from '@nestjs/jwt';
import { BcryptService } from '../../../src/common';

describe('Users Read Api', () => {
  const baseSetup: BaseSetup = new BaseSetup();
  let request: supertest.SuperAgentTest;
  let prisma: PrismaService;
  let bcrypt: BcryptService;
  let jwt: JwtService;

  const defaultUser = {
    name: 'User test',
    email: 'email@domain.com',
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

  describe(`/users/:id (GET)`, () => {
    it('should return status code 403 when not send authorization code', async () => {
      const id = '19acb732-0afd-49d2-9db7-a43ae9120479';
      const result = await request.get(`/api/users/${id}`);
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
      const result = await request.get(`/api/users/${user.id}`).set(headers);
      expect(result.statusCode).toBe(403);
      expect(result.body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403,
      });
    });

    it('should return status code 200 when authenticated user have the right permission', async () => {
      const user = await prisma.user.create({
        data: {
          ...defaultUser,
          password: bcrypt.hash('example'),
          roles: {
            create: {
              name: 'users',
              description: 'users',
              permissions: {
                create: {
                  name: 'users:read',
                  description: 'list users',
                },
              },
            },
          },
        },
        include: {
          roles: true,
        },
      });
      const payload = { sub: user.id, email: user.email };
      const accessToken = await jwt.signAsync(payload);
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const result = await request.get(`/api/users/${user.id}`).set(headers);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        roles: user.roles.map((role) => role.id),
      });
    });
  });
});
