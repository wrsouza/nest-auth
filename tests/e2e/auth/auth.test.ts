import supertest from 'supertest';
import { BaseSetup } from '../base-setup';
import { PrismaService } from '../../../src/config';
import { JwtService } from '@nestjs/jwt';
import { BcryptService } from '../../../src/common';

describe('Auth API', () => {
  const baseSetup: BaseSetup = new BaseSetup();
  let request: supertest.SuperAgentTest;
  let prisma: PrismaService;
  let bcrypt: BcryptService;
  let jwt: JwtService;

  beforeAll(async () => {
    await baseSetup.beforeAll();
    request = baseSetup.Request;
    prisma = baseSetup.Prisma;
    jwt = baseSetup.Jwt;
    bcrypt = baseSetup.Bcrypt;
  });

  afterEach(() => baseSetup.afterEach());
  afterAll(() => baseSetup.afterAll());

  describe(`/auth (POST)`, () => {
    it('should return status code 400 when send empty body', async () => {
      const body = {};
      const result = await request.post('/api/auth').send(body);
      expect(result.statusCode).toBe(400);
      expect(result.body).toEqual({
        error: 'Bad Request',
        message: ['email must be an email', 'password must be a string'],
        statusCode: 400,
      });
    });

    it('should return status code 400 when send credentials invalid', async () => {
      const body = {
        email: 'email@domain.com',
        password: 'example',
      };
      const result = await request.post('/api/auth').send(body);
      expect(result.statusCode).toBe(400);
      expect(result.body).toEqual({
        error: 'Bad Request',
        message: 'Invalid email or password',
        statusCode: 400,
      });
    });

    it('should return status code 200 when send credentials correctly', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'User test',
          email: 'email@domain.com',
          password: bcrypt.hash('example'),
          isActive: true,
          isAdmin: false,
        },
      });
      const body = {
        email: 'email@domain.com',
        password: 'example',
      };
      const result = await request.post('/api/auth').send(body);
      expect(result.statusCode).toBe(200);
      expect(result.body).toHaveProperty('accessToken');
      expect(result.body).toEqual(
        expect.objectContaining({
          id: user.id,
          name: user.name,
          email: user.email,
        }),
      );
    });
  });

  describe(`/auth (GET)`, () => {
    it('should return status code 403 when not sending authorization code', async () => {
      const result = await request.get('/api/auth');
      expect(result.statusCode).toBe(403);
      expect(result.body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403,
      });
    });

    it('should return status code 403 when send invalid authorization code', async () => {
      const accessToken = 'Basic 123';
      const headers = {
        Authorization: accessToken,
      };
      const result = await request.get('/api/auth').set(headers);
      expect(result.statusCode).toBe(403);
      expect(result.body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403,
      });
    });

    it('should return status code 403 when send valid authorization code but user is inactive', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'User test',
          email: 'email@domain.com',
          password: bcrypt.hash('example'),
          isActive: false,
          isAdmin: false,
        },
      });
      const payload = { sub: user.id, email: user.email };
      const accessToken = await jwt.signAsync(payload);
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const result = await request.get('/api/auth').set(headers);
      expect(result.statusCode).toBe(403);
      expect(result.body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403,
      });
    });

    it('should return status code 200 when send valid authorization code', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'User test',
          email: 'email@domain.com',
          password: bcrypt.hash('example'),
          isActive: true,
          isAdmin: false,
        },
      });
      const payload = { sub: user.id, email: user.email };
      const accessToken = await jwt.signAsync(payload);
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const result = await request.get('/api/auth').set(headers);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        roles: [],
      });
    });
  });
});
