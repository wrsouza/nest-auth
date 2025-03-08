import supertest from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { BaseSetup } from '../base-setup';
import { PrismaService } from '../../../src/config';
import { BcryptService } from '../../../src/common';
import { getAuthenticatedUserWithoutRoles } from '../users/users.testcases';

describe('Auth Refresh Token API', () => {
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

  describe('/auth/refresh (POST)', () => {
    it('should return status code 403 when not sending authorization code', async () => {
      // Act
      const result = await request.post('/api/auth/refresh');

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
      const result = await request.post('/api/auth/refresh').set(headers);

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
      const result = await request.post('/api/auth/refresh').set(headers);

      // Assert
      expect(result.statusCode).toBe(403);
      expect(result.body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403,
      });
    });

    it('should return status code 200 and new access token when send valid authorization code', async () => {
      // Arrange
      const { headers, authenticatedUser } =
        await getAuthenticatedUserWithoutRoles(prisma, bcrypt, jwt);
      const signAsyncSpy = jest
        .spyOn(jwt, 'signAsync')
        .mockResolvedValueOnce('new-access-token');

      // Act
      const result = await request.post('/api/auth/refresh').set(headers);

      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body).toHaveProperty('accessToken');
      expect(result.body).toEqual(
        expect.objectContaining({
          id: authenticatedUser.id,
          name: authenticatedUser.name,
          email: authenticatedUser.email,
          accessToken: 'new-access-token',
        }),
      );
      expect(signAsyncSpy).toHaveBeenCalledWith({
        sub: authenticatedUser.id,
        email: authenticatedUser.email,
      });
    });
  });
});
