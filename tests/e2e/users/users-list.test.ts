import supertest from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { BaseSetup } from '../base-setup';
import { PrismaService } from '../../../src/config';
import { BcryptService } from '../../../src/common';
import {
  getAuthenticatedUserWithoutRoles,
  getAuthenticatedUserWithRoles,
} from './users.testcases';

describe('Users List Api', () => {
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

  describe(`/users (GET)`, () => {
    it('should return status code 403 when not send authorization code', async () => {
      // Act
      const result = await request.get('/api/users');

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
      const result = await request.get('/api/users').set(headers);

      // Assert
      expect(result.statusCode).toBe(403);
      expect(result.body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403,
      });
    });

    it('should return status code 200 when authenticated user have the right permission', async () => {
      // Arrange
      const { headers, authenticatedUser } =
        await getAuthenticatedUserWithRoles(prisma, bcrypt, jwt, 'users:list');

      // Act
      const result = await request.get('/api/users').set(headers);

      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual([
        {
          id: authenticatedUser.id,
          name: authenticatedUser.name,
          email: authenticatedUser.email,
          isActive: authenticatedUser.isActive,
          isAdmin: authenticatedUser.isAdmin,
          createdAt: authenticatedUser.createdAt.toISOString(),
          updatedAt: authenticatedUser.updatedAt.toISOString(),
        },
      ]);
    });
  });
});
