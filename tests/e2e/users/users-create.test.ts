import supertest from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { BaseSetup } from '../base-setup';
import { PrismaService } from '../../../src/config';
import { BcryptService } from '../../../src/common';
import {
  defaultAuthenticateUser,
  defaultUser,
  getAuthenticatedUserWithoutRoles,
  getAuthenticatedUserWithRoles,
} from './users.testcases';

describe('Users Create Api', () => {
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

  beforeEach(() => baseSetup.beforeEach());
  afterEach(() => baseSetup.afterEach());
  afterAll(() => baseSetup.afterAll());

  describe(`/users (POST)`, () => {
    it('should return status code 403 when not send authorization code', async () => {
      // Act
      const result = await request.post('/api/users').send({});

      // Assert
      expect(result.statusCode).toBe(403);
      expect(result.body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403,
      });
    });

    it('should return status code 403 when user not have permission', async () => {
      // Arrange
      const { headers } = await getAuthenticatedUserWithoutRoles(
        prisma,
        bcrypt,
        jwt,
      );

      // Act
      const result = await request.post('/api/users').set(headers).send({});

      // Assert
      expect(result.statusCode).toBe(403);
      expect(result.body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403,
      });
    });

    it('should return status code 400 when send empty body', async () => {
      // Arrange
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'users:create',
      );
      const body = {};

      // Act
      const result = await request.post('/api/users').set(headers).send(body);

      // Assert
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
      // Arrange
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'users:create',
      );
      const body = {
        ...defaultAuthenticateUser,
      };

      // Act
      const result = await request.post('/api/users').set(headers).send(body);

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body).toEqual({
        error: 'Bad Request',
        message: 'User already exists',
        statusCode: 400,
      });
    });

    it('should return status code 201 and create a user', async () => {
      // Arrange
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'users:create',
      );
      const body = {
        ...defaultUser,
      };

      // Act
      const result = await request.post('/api/users').set(headers).send(body);

      // Assert
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

      // Check in Database
      const { id } = result.body as { id: string };
      const userCreated = await prisma.user.findUniqueOrThrow({
        where: {
          id,
        },
      });
      expect(userCreated.name).toEqual(body.name);
      expect(userCreated.email).toEqual(body.email);
      expect(userCreated.isActive).toEqual(body.isActive);
      expect(userCreated.isAdmin).toEqual(body.isAdmin);

      // Check Password in Database
      const compare = bcrypt.compare(body.password, userCreated.password);
      expect(compare).toBeTruthy();
    });
  });
});
