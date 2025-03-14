import supertest from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { BaseSetup } from '../base-setup';
import { PrismaService } from '../../../src/config';
import { BcryptService, ResponseErrorEnum } from '../../../src/common';
import {
  getAuthenticatedUserWithoutRoles,
  getAuthenticatedUserWithRoles,
} from '../users/users.testcases';
import { randomUUID } from 'node:crypto';
import { createDefaultPermission } from './permissions.testcases';

describe('Permissions Delete Api', () => {
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

  describe(`/permissions/:id (GET)`, () => {
    it('should return status code 403 when not send authorization code', async () => {
      // Arrange
      const id = randomUUID();

      // Act
      const result = await request.get(`/api/permissions/${id}`);

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
      const id = randomUUID();

      // Act
      const result = await request.get(`/api/permissions/${id}`).set(headers);

      // Assert
      expect(result.statusCode).toBe(403);
      expect(result.body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403,
      });
    });

    it('should return status code 404 when permission is not found', async () => {
      // Arrange
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'permissions:read',
      );
      const id = randomUUID();

      // Act
      const result = await request.get(`/api/permissions/${id}`).set(headers);

      // Assert
      expect(result.statusCode).toBe(404);
      expect(result.body).toEqual({
        error: 'Not Found',
        message: ResponseErrorEnum.PERMISSION_NOT_FOUND,
        statusCode: 404,
      });
    });

    it('should return status code 200 when permission is found', async () => {
      // Arrange
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'permissions:read',
      );
      const { permission } = await createDefaultPermission(prisma);
      const { id } = permission;

      // Act
      const result = await request.get(`/api/permissions/${id}`).set(headers);

      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({
        ...permission,
        createdAt: permission.createdAt.toISOString(),
        updatedAt: permission.updatedAt.toISOString(),
      });
    });
  });
});
