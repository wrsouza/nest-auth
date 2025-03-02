import supertest from 'supertest';
import { BaseSetup } from '../base-setup';
import { PrismaService } from '../../../src/config';
import { JwtService } from '@nestjs/jwt';
import { BcryptService } from '../../../src/common';

describe('Users Update Api', () => {
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

  describe(`/users/:id (PUT)`, () => {
    it('should return status code 403 when not send authorization code', async () => {
      const id = '19acb732-0afd-49d2-9db7-a43ae9120479';
      const result = await request.put(`/api/users/${id}`);
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
      const result = await request.put(`/api/users/${user.id}`).set(headers);
      expect(result.statusCode).toBe(403);
      expect(result.body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403,
      });
    });

    it('should return status code 400 when send wrong data', async () => {
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
                  name: 'users:update',
                  description: 'update users',
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
      const body = {
        email: 'wrong-email',
        password: '123',
      };
      const result = await request
        .put(`/api/users/${user.id}`)
        .set(headers)
        .send(body);
      expect(result.statusCode).toBe(400);
      expect(result.body).toEqual({
        error: 'Bad Request',
        message: [
          'email must be an email',
          'password must be longer than or equal to 6 characters',
        ],
        statusCode: 400,
      });
    });

    it('should return status code 404 when send wrong user id', async () => {
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
                  name: 'users:update',
                  description: 'update users',
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
      const body = {
        ...defaultUser,
      };
      const id = '19acb732-0afd-49d2-9db7-a43ae9120479';
      const result = await request
        .put(`/api/users/${id}`)
        .set(headers)
        .send(body);
      expect(result.statusCode).toBe(404);
    });

    it('should return status code 400 when send email that already exists', async () => {
      const body = {
        name: 'John Doe',
        email: 'john.doe@domain.com',
        password: 'example',
        isActive: true,
        isAdmin: false,
      };
      await prisma.user.create({
        data: {
          ...body,
        },
      });
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
                  name: 'users:update',
                  description: 'update users',
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
      const result = await request
        .put(`/api/users/${user.id}`)
        .set(headers)
        .send(body);
      expect(result.statusCode).toBe(400);
      expect(result.body).toEqual({
        error: 'Bad Request',
        message: 'User already exists',
        statusCode: 400,
      });
    });

    it('should return status code 200 and update user', async () => {
      const body = {
        name: 'John Doe',
        email: 'john.doe@domain.com',
        password: 'example',
        isActive: true,
        isAdmin: false,
      };
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
                  name: 'users:update',
                  description: 'update users',
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
      const result = await request
        .put(`/api/users/${user.id}`)
        .set(headers)
        .send(body);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(
        expect.objectContaining({
          id: user.id,
          name: body.name,
          email: body.email,
          isActive: body.isActive,
          isAdmin: body.isAdmin,
          createdAt: user.createdAt.toISOString(),
        }),
      );
    });
  });
});
