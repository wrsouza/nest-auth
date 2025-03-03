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
import {
  createDefaultRoleWithoutPermission,
  defaultRole,
} from './roles.testcases';

describe('Roles Update Api', () => {
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

  describe(`/roles/:id (PUT)`, () => {
    it('should return status code 403 when not send authorization code', async () => {
      // Arrange
      const id = randomUUID();

      // Act
      const result = await request.put(`/api/roles/${id}`).send({});

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
        .put(`/api/roles/${id}`)
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

    it('should return status code 404 when role is not found', async () => {
      // Arrange
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'roles:update',
      );
      const body = {
        ...defaultRole,
      };
      const id = randomUUID();

      // Act
      const result = await request
        .put(`/api/roles/${id}`)
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

    it('should return status code 200 when role is updated', async () => {
      // Arrange
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'roles:update',
      );
      const { role } = await createDefaultRoleWithoutPermission(prisma);
      const body = {
        name: 'roles:test',
        description: 'description of roles',
      };
      const { id } = role;

      // Act
      const result = await request
        .put(`/api/roles/${id}`)
        .set(headers)
        .send(body);

      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(
        expect.objectContaining({
          id,
          name: body.name,
          description: body.description,
          createdAt: role.createdAt.toISOString(),
        }),
      );

      // Check in Database
      const roleUpdated = await prisma.role.findUniqueOrThrow({
        where: {
          id,
        },
      });
      expect(roleUpdated.name).toEqual(body.name);
      expect(roleUpdated.description).toEqual(body.description);
    });
  });
});
