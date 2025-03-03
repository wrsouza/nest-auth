import supertest from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { BaseSetup } from '../base-setup';
import { PrismaService } from '../../../src/config';
import { BcryptService } from '../../../src/common';
import {
  createDefaultUserWithoutRole,
  getAuthenticatedUserWithoutRoles,
  getAuthenticatedUserWithRoles,
} from './users.testcases';

describe('Users Delete Api', () => {
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

  describe(`/users/:id (DELETE)`, () => {
    it('should return status code 403 when not send authorization code', async () => {
      // Arrange
      const id = '19acb732-0afd-49d2-9db7-a43ae9120479';

      // Act
      const result = await request.delete(`/api/users/${id}`).send({});

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
      const id = '19acb732-0afd-49d2-9db7-a43ae9120479';

      // Act
      const result = await request
        .delete(`/api/users/${id}`)
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

    it('should return status code 404 when send wrong user id', async () => {
      // Arrange
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'users:delete',
      );
      const id = '19acb732-0afd-49d2-9db7-a43ae9120479';

      // Act
      const result = await request.delete(`/api/users/${id}`).set(headers);

      // Assert
      expect(result.statusCode).toBe(404);
      expect(result.body).toEqual({
        error: 'Not Found',
        message: 'User not found',
        statusCode: 404,
      });
    });

    it('should return status code 204 and delete a user', async () => {
      // Arrange
      const { userCreated } = await createDefaultUserWithoutRole(
        prisma,
        bcrypt,
      );
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'users:delete',
      );
      const { id } = userCreated;

      // Act
      const result = await request.delete(`/api/users/${id}`).set(headers);

      // Assert
      expect(result.statusCode).toBe(204);
      expect(result.body).toEqual({});

      // Check in Database
      const userDeleted = await prisma.user.findUnique({ where: { id } });
      expect(userDeleted).toBeNull();
    });
  });
});
