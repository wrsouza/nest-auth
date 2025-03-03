import supertest from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { BaseSetup } from '../base-setup';
import { PrismaService } from '../../../src/config';
import { BcryptService } from '../../../src/common';
import {
  getAuthenticatedUserWithoutRoles,
  getAuthenticatedUserWithRoles,
} from './users.testcases';

describe('Users Read Api', () => {
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

  describe(`/users/:id (GET)`, () => {
    it('should return status code 403 when not send authorization code', async () => {
      // Arrange
      const id = '19acb732-0afd-49d2-9db7-a43ae9120479';

      // Act
      const result = await request.get(`/api/users/${id}`);

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
      const { headers, authenticatedUser } =
        await getAuthenticatedUserWithoutRoles(prisma, bcrypt, jwt);
      const { id } = authenticatedUser;

      // Act
      const result = await request.get(`/api/users/${id}`).set(headers);

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
        await getAuthenticatedUserWithRoles(prisma, bcrypt, jwt, 'users:read');
      const { id } = authenticatedUser;

      // Act
      const result = await request.get(`/api/users/${id}`).set(headers);

      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({
        id: authenticatedUser.id,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        isActive: authenticatedUser.isActive,
        isAdmin: authenticatedUser.isAdmin,
        createdAt: authenticatedUser.createdAt.toISOString(),
        updatedAt: authenticatedUser.updatedAt.toISOString(),
        roles: authenticatedUser.roles.map((role) => role.id),
      });
    });
  });
});
