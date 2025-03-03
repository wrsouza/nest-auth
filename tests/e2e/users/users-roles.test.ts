import supertest from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { BaseSetup } from '../base-setup';
import { PrismaService } from '../../../src/config';
import { BcryptService } from '../../../src/common';
import {
  createDefaultUserWithoutRole,
  createDefaultUserWithRole,
  getAuthenticatedUserWithoutRoles,
  getAuthenticatedUserWithRoles,
} from './users.testcases';
import { createDefaultRoleWithPermission } from '../roles/roles.testcases';

describe('Users Roles Api', () => {
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

  describe(`/users/:id/roles (PUT)`, () => {
    it('should return status code 403 when not send authorization code', async () => {
      // Arrange
      const id = '19acb732-0afd-49d2-9db7-a43ae9120479';

      // Act
      const result = await request.put(`/api/users/${id}/roles`);

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
      const result = await request.put(`/api/users/${id}/roles`).set(headers);

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
      const { headers, authenticatedUser } =
        await getAuthenticatedUserWithRoles(prisma, bcrypt, jwt, 'users:roles');
      const { id } = authenticatedUser;
      const body = {};

      // Act
      const result = await request
        .put(`/api/users/${id}/roles`)
        .set(headers)
        .send(body);

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body).toEqual({
        error: 'Bad Request',
        message: ['roles must be an array'],
        statusCode: 400,
      });
    });

    it('should return status code 404 when user not found', async () => {
      // Arrange
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'users:roles',
      );
      const id = '19acb732-0afd-49d2-9db7-a43ae9120479';
      const body = {
        roles: [],
      };

      // Act
      const result = await request
        .put(`/api/users/${id}/roles`)
        .set(headers)
        .send(body);

      // Assert
      expect(result.statusCode).toBe(404);
      expect(result.body).toEqual({
        error: 'Not Found',
        message: 'User not found',
        statusCode: 404,
      });
    });

    it('should return status code 404 when role not found', async () => {
      // Arrange
      const { headers, authenticatedUser } =
        await getAuthenticatedUserWithRoles(prisma, bcrypt, jwt, 'users:roles');
      const id = authenticatedUser.id;
      const body = {
        roles: ['19acb732-0afd-49d2-9db7-a43ae9120479'],
      };

      // Act
      const result = await request
        .put(`/api/users/${id}/roles`)
        .set(headers)
        .send(body);

      // Assert
      expect(result.statusCode).toBe(404);
      expect(result.body).toEqual({
        error: 'Not Found',
        message: 'Role not found',
        statusCode: 404,
      });
    });

    it('should return status code 200 and remove all user roles', async () => {
      // Arrange
      const { userCreated } = await createDefaultUserWithRole(
        prisma,
        bcrypt,
        'users:list',
      );
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'users:roles',
      );
      const { id } = userCreated;
      const body = {
        roles: [],
      };

      // Act
      const result = await request
        .put(`/api/users/${id}/roles`)
        .set(headers)
        .send(body);

      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(
        expect.objectContaining({
          id: userCreated.id,
          name: userCreated.name,
          email: userCreated.email,
          isActive: userCreated.isActive,
          isAdmin: userCreated.isAdmin,
          createdAt: userCreated.createdAt.toISOString(),
          roles: [],
        }),
      );

      // Check user roles in Database
      const checkUser = await prisma.user.findUnique({
        where: { id },
        include: { roles: true },
      });
      expect(checkUser?.roles).toEqual([]);
    });

    it('should return status code 200 and connect user to role', async () => {
      // Arrange
      const { role } = await createDefaultRoleWithPermission(
        prisma,
        'users:list',
      );
      const { userCreated } = await createDefaultUserWithoutRole(
        prisma,
        bcrypt,
      );
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'users:roles',
      );
      const { id } = userCreated;
      const body = {
        roles: [role.id],
      };

      // Act
      const result = await request
        .put(`/api/users/${id}/roles`)
        .set(headers)
        .send(body);

      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(
        expect.objectContaining({
          id: userCreated.id,
          name: userCreated.name,
          email: userCreated.email,
          isActive: userCreated.isActive,
          isAdmin: userCreated.isAdmin,
          createdAt: userCreated.createdAt.toISOString(),
          roles: [role.id],
        }),
      );

      // Check user roles in Database
      const checkUser = await prisma.user.findUnique({
        where: { id },
        include: { roles: true },
      });
      expect(checkUser?.roles).toEqual([role]);
    });

    it('should return status code 200 and disconnect user from old roles and connect user to a new role', async () => {
      // Arrange
      const { role } = await createDefaultRoleWithPermission(
        prisma,
        'users:list',
      );
      const { userCreated } = await createDefaultUserWithRole(
        prisma,
        bcrypt,
        'users:read',
      );
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'users:roles',
      );
      const { id } = userCreated;
      const body = {
        roles: [role.id],
      };

      // Act
      const result = await request
        .put(`/api/users/${id}/roles`)
        .set(headers)
        .send(body);

      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(
        expect.objectContaining({
          id: userCreated.id,
          name: userCreated.name,
          email: userCreated.email,
          isActive: userCreated.isActive,
          isAdmin: userCreated.isAdmin,
          createdAt: userCreated.createdAt.toISOString(),
          roles: [role.id],
        }),
      );

      // Check user roles in Database
      const checkUser = await prisma.user.findUnique({
        where: { id },
        include: { roles: true },
      });
      expect(checkUser?.roles).toEqual([role]);
    });
  });
});
