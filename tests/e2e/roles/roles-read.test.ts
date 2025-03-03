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
import { createDefaultRoleWithPermission } from './roles.testcases';

describe('Roles Delete Api', () => {
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

  describe(`/roles/:id (GET)`, () => {
    it('should return status code 403 when not send authorization code', async () => {
      // Arrange
      const id = randomUUID();

      // Act
      const result = await request.get(`/api/roles/${id}`);

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
      const result = await request.get(`/api/roles/${id}`).set(headers);

      // Assert
      expect(result.statusCode).toBe(403);
      expect(result.body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403,
      });
    });

    it('should return status code 404 when send id is not exists', async () => {
      // Arrange
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'roles:read',
      );
      const id = randomUUID();

      // Act
      const result = await request.get(`/api/roles/${id}`).set(headers);

      // Assert
      expect(result.statusCode).toBe(404);
      expect(result.body).toEqual({
        error: 'Not Found',
        message: ResponseErrorEnum.ROLE_NOT_FOUND,
        statusCode: 404,
      });
    });

    it('should return status code 200 when role is found', async () => {
      // Arrange
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'roles:read',
      );
      const { role } = await createDefaultRoleWithPermission(
        prisma,
        'roles:list',
      );
      const { id } = role;

      // Act
      const result = await request.get(`/api/roles/${id}`).set(headers);

      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({
        ...role,
        permissions: role.permissions.map((permission) => permission.id),
        createdAt: role.createdAt.toISOString(),
        updatedAt: role.updatedAt.toISOString(),
      });
    });
  });
});
