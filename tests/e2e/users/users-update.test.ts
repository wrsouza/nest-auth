import supertest from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { BaseSetup } from '../base-setup';
import { PrismaService } from '../../../src/config';
import { BcryptService } from '../../../src/common';
import {
  createDefaultUserWithoutRole,
  defaultAuthenticateUser,
  defaultUser,
  getAuthenticatedUserWithoutRoles,
  getAuthenticatedUserWithRoles,
} from './users.testcases';

describe('Users Update Api', () => {
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

  describe(`/users/:id (PUT)`, () => {
    it('should return status code 403 when not send authorization code', async () => {
      // Arrange
      const id = '19acb732-0afd-49d2-9db7-a43ae9120479';

      // Act
      const result = await request.put(`/api/users/${id}`);

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
      const result = await request.put(`/api/users/${id}`).set(headers);

      // Assert
      expect(result.statusCode).toBe(403);
      expect(result.body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403,
      });
    });

    it('should return status code 400 when send wrong data', async () => {
      // Arrange
      const { headers, authenticatedUser } =
        await getAuthenticatedUserWithRoles(
          prisma,
          bcrypt,
          jwt,
          'users:update',
        );
      const body = {
        email: 'wrong-email',
        password: '123',
      };
      const { id } = authenticatedUser;

      // Act
      const result = await request
        .put(`/api/users/${id}`)
        .set(headers)
        .send(body);

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body).toEqual({
        error: 'Bad Request',
        message: [
          'email must be an email',
          'password must be longer than or equal to 6 characters',
        ],
        statusCode: 400,
      });
    });

    it('should return status code 404 when send wrong user id', async () => {
      // Arrange
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'users:update',
      );
      const body = {
        ...defaultUser,
      };
      const id = '19acb732-0afd-49d2-9db7-a43ae9120479';

      // Act
      const result = await request
        .put(`/api/users/${id}`)
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

    it('should return status code 400 when send email that already exists', async () => {
      // Arrange
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'users:update',
      );
      const { userCreated } = await createDefaultUserWithoutRole(
        prisma,
        bcrypt,
      );
      const body = {
        ...defaultAuthenticateUser,
      };
      const { id } = userCreated;

      // Act
      const result = await request
        .put(`/api/users/${id}`)
        .set(headers)
        .send(body);

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body).toEqual({
        error: 'Bad Request',
        message: 'User already exists',
        statusCode: 400,
      });
    });

    it('should return status code 200 and update user', async () => {
      // Arrange
      const { headers, authenticatedUser } =
        await getAuthenticatedUserWithRoles(
          prisma,
          bcrypt,
          jwt,
          'users:update',
        );
      const body = {
        ...defaultUser,
      };
      const { id } = authenticatedUser;
      const result = await request
        .put(`/api/users/${id}`)
        .set(headers)
        .send(body);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(
        expect.objectContaining({
          id: authenticatedUser.id,
          name: body.name,
          email: body.email,
          isActive: body.isActive,
          isAdmin: body.isAdmin,
          createdAt: authenticatedUser.createdAt.toISOString(),
        }),
      );
    });
  });
});
