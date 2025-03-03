import supertest from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { BaseSetup } from '../base-setup';
import { PrismaService } from '../../../src/config';
import { BcryptService, ResponseErrorEnum } from '../../../src/common';
import {
  getAuthenticatedUserWithoutRoles,
  getAuthenticatedUserWithRoles,
} from '../users/users.testcases';
import {
  createDefaultPermission,
  defaultPermission,
} from './permissions.testcases';

describe('Permissions Create Api', () => {
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

  describe(`/permissions (POST)`, () => {
    it('should return status code 403 when not send authorization code', async () => {
      // Act
      const result = await request.post('/api/permissions').send({});

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

      // Act
      const result = await request
        .post('/api/permissions')
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

    it('should return status code 400 when send empty body', async () => {
      // Arrange
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'permissions:create',
      );
      const body = {};

      // Act
      const result = await request
        .post('/api/permissions')
        .set(headers)
        .send(body);

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body).toEqual({
        error: 'Bad Request',
        message: [
          'name must be longer than or equal to 3 characters',
          'name must be a string',
          'description must be longer than or equal to 3 characters',
          'description must be a string',
        ],
        statusCode: 400,
      });
    });

    it('should return status code 400 when send name already exists', async () => {
      // Arrange
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'permissions:create',
      );
      await createDefaultPermission(prisma);
      const body = {
        ...defaultPermission,
      };

      // Act
      const result = await request
        .post('/api/permissions')
        .set(headers)
        .send(body);

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body).toEqual({
        error: 'Bad Request',
        message: ResponseErrorEnum.PERMISSION_ALREADY_EXISTS,
        statusCode: 400,
      });
    });

    it('should return status code 201 and create a permission', async () => {
      // Arrange
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'permissions:create',
      );
      const body = {
        ...defaultPermission,
      };

      // Act
      const result = await request
        .post('/api/permissions')
        .set(headers)
        .send(body);

      // Assert
      expect(result.statusCode).toBe(201);
      expect(result.body).toHaveProperty('id');
      expect(result.body).toHaveProperty('updatedAt');
      expect(result.body).toHaveProperty('createdAt');
      expect(result.body).toEqual(
        expect.objectContaining({
          name: body.name,
          description: body.description,
        }),
      );

      // Check in Database
      const { id } = result.body as { id: string };
      const permissionCreated = await prisma.permission.findUniqueOrThrow({
        where: {
          id,
        },
      });
      expect(permissionCreated.name).toEqual(body.name);
      expect(permissionCreated.description).toEqual(body.description);
    });
  });
});
