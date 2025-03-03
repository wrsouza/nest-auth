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
import { createDefaultPermission } from '../permissions/permissions.testcases';

describe('Roles Permissions Api', () => {
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

  describe(`/roles/:id/permissions (PUT)`, () => {
    it('should return status code 403 when not send authorization code', async () => {
      // Arrange
      const id = randomUUID();

      // Act
      const result = await request.put(`/api/roles/${id}/permissions`).send({});

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
      const result = await request
        .put(`/api/roles/${id}/permissions`)
        .set(headers)
        .send({});

      // Assert
      expect(result.statusCode).toBe(403);
      expect(result.body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403,
      });
    });

    it('should return status code 400 when send missing data', async () => {
      // Arrange
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'roles:permissions',
      );
      const id = randomUUID();
      const body = {};

      // Act
      const result = await request
        .put(`/api/roles/${id}/permissions`)
        .set(headers)
        .send(body);

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body).toEqual({
        error: 'Bad Request',
        message: ['permissions must be an array'],
        statusCode: 400,
      });
    });

    it('should return status code 404 when role not found', async () => {
      // Arrange
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'roles:permissions',
      );
      const id = randomUUID();
      const body = {
        permissions: [],
      };

      // Act
      const result = await request
        .put(`/api/roles/${id}/permissions`)
        .set(headers)
        .send(body);

      // Assert
      expect(result.statusCode).toBe(404);
      expect(result.body).toEqual({
        error: 'Not Found',
        message: ResponseErrorEnum.ROLE_NOT_FOUND,
        statusCode: 404,
      });
    });

    it('should return status code 200 and remove all role permissions', async () => {
      // Arrange
      const { role } = await createDefaultRoleWithPermission(
        prisma,
        'roles:list',
      );
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'roles:permissions',
      );
      const { id } = role;
      const body = {
        permissions: [],
      };

      // Act
      const result = await request
        .put(`/api/roles/${id}/permissions`)
        .set(headers)
        .send(body);

      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(
        expect.objectContaining({
          id: role.id,
          name: role.name,
          description: role.description,
          createdAt: role.createdAt.toISOString(),
          updatedAt: role.updatedAt.toISOString(),
          permissions: [],
        }),
      );

      // Check role permissions in Database
      const checkRole = await prisma.role.findUnique({
        where: { id },
        include: { permissions: true },
      });
      expect(checkRole?.permissions).toEqual([]);
    });

    it('should return status code 200 and connect role to permission', async () => {
      // Arrange
      const { role } = await createDefaultRoleWithPermission(
        prisma,
        'roles:list',
      );
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'roles:permissions',
      );
      const { id } = role;
      const body = {
        permissions: [role.permissions[0].id],
      };

      // Act
      const result = await request
        .put(`/api/roles/${id}/permissions`)
        .set(headers)
        .send(body);

      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(
        expect.objectContaining({
          id: role.id,
          name: role.name,
          description: role.description,
          createdAt: role.createdAt.toISOString(),
          updatedAt: role.updatedAt.toISOString(),
          permissions: [role.permissions[0].id],
        }),
      );

      // Check role permissions in Database
      const checkRole = await prisma.role.findUnique({
        where: { id },
        include: { permissions: true },
      });
      expect(checkRole?.permissions).toEqual(role.permissions);
    });

    it('should return status code 200 and disconnect role from old permissions and connect to new permissions', async () => {
      // Arrange
      const { role } = await createDefaultRoleWithPermission(
        prisma,
        'roles:list',
      );
      const { permission } = await createDefaultPermission(prisma, {
        name: 'users:update',
      });
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'roles:permissions',
      );
      const { id } = role;
      const body = {
        permissions: [permission.id],
      };

      // Act
      const result = await request
        .put(`/api/roles/${id}/permissions`)
        .set(headers)
        .send(body);

      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(
        expect.objectContaining({
          id: role.id,
          name: role.name,
          description: role.description,
          createdAt: role.createdAt.toISOString(),
          updatedAt: role.updatedAt.toISOString(),
          permissions: [permission.id],
        }),
      );

      // Check role permissions in Database
      const checkRole = await prisma.role.findUnique({
        where: { id },
        include: { permissions: true },
      });
      expect(checkRole?.permissions).toEqual([permission]);
    });
  });
});
