import supertest from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { BaseSetup } from '../base-setup';
import { PrismaService } from '../../../src/config';
import { BcryptService } from '../../../src/common';
import { getAuthenticatedUserWithoutRoles } from '../users/users.testcases';

describe('Auth Profile API', () => {
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

  describe(`/auth (GET)`, () => {
    it('should return status code 403 when not sending authorization code', async () => {
      // Act
      const result = await request.get('/api/auth');

      // Assert
      expect(result.statusCode).toBe(403);
      expect(result.body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403,
      });
    });

    it('should return status code 403 when send invalid authorization code', async () => {
      // Arrange
      const accessToken = 'Basic 123';
      const headers = {
        Authorization: accessToken,
      };

      // Act
      const result = await request.get('/api/auth').set(headers);

      // Assert
      expect(result.statusCode).toBe(403);
      expect(result.body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403,
      });
    });

    it('should return status code 403 when send valid authorization code but user is inactive', async () => {
      // Arrange
      const { headers } = await getAuthenticatedUserWithoutRoles(
        prisma,
        bcrypt,
        jwt,
        { isActive: false },
      );

      // Act
      const result = await request.get('/api/auth').set(headers);

      // Assert
      expect(result.statusCode).toBe(403);
      expect(result.body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403,
      });
    });

    it('should return status code 200 when send valid authorization code', async () => {
      // Arrange
      const { headers, authenticatedUser } =
        await getAuthenticatedUserWithoutRoles(prisma, bcrypt, jwt);

      // Act
      const result = await request.get('/api/auth').set(headers);

      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({
        id: authenticatedUser.id,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        isAdmin: authenticatedUser.isAdmin,
        roles: [],
      });
    });
  });
});
