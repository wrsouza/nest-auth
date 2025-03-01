import supertest from 'supertest';
import { BaseSetup } from '../base-setup';
import { PrismaService } from '../../../src/config';
import { JwtService } from '@nestjs/jwt';
import { BcryptService } from '../../../src/common';

describe('Users Create Api', () => {
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

  describe(`/users (POST)`, () => {
    it('should return status code 403 when not send authorization code', async () => {
      const result = await request.post('/api/users').send({});
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
      const result = await request.post('/api/users').set(headers).send({});
      expect(result.statusCode).toBe(403);
      expect(result.body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403,
      });
    });

    it('should return status code 400 when send empty body', async () => {
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
                  name: 'users:create',
                  description: 'create users',
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
      const result = await request.post('/api/users').set(headers).send(body);
      expect(result.statusCode).toBe(400);
      expect(result.body).toEqual({
        error: 'Bad Request',
        message: [
          'name must be longer than or equal to 3 characters',
          'name must be a string',
          'email must be an email',
          'password must be longer than or equal to 6 characters',
          'password must be a string',
          'isActive must be a boolean value',
          'isAdmin must be a boolean value',
        ],
        statusCode: 400,
      });
    });

    it('should return status 400 when send email already exists', async () => {
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
                  name: 'users:create',
                  description: 'create users',
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
      const result = await request.post('/api/users').set(headers).send(body);
      expect(result.statusCode).toBe(400);
      expect(result.body).toEqual({
        error: 'Bad Request',
        message: 'User already exists',
        statusCode: 400,
      });
    });

    it('should return status code 201 when authenticated user have the right permission', async () => {
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
                  name: 'users:create',
                  description: 'create users',
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
        name: 'John Doe',
        email: 'john.doe@domain.com',
        password: 'example',
        isActive: true,
        isAdmin: false,
      };
      const result = await request.post('/api/users').set(headers).send(body);
      expect(result.statusCode).toBe(201);
      expect(result.body).toHaveProperty('id');
      expect(result.body).toHaveProperty('createdAt');
      expect(result.body).toHaveProperty('updatedAt');
      expect(result.body).toEqual(
        expect.objectContaining({
          name: body.name,
          email: body.email,
          isActive: body.isActive,
          isAdmin: body.isAdmin,
        }),
      );
    });
  });
});
