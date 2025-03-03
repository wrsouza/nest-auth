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
  createDefaultRoleWithoutPermission,
  defaultRole,
} from './roles.testcases';

describe('Roles Create Api', () => {
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

  describe(`/roles (POST)`, () => {
    it('should return status code 403 when not send authorization code', async () => {
      // Act
      const result = await request.post('/api/roles').send({});

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
      const result = await request.post('/api/roles').set(headers).send({});

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
        'roles:create',
      );
      const body = {};

      // Act
      const result = await request.post('/api/roles').set(headers).send(body);

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

    it('should return status code 400 when role name already exists', async () => {
      // Arrange
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'roles:create',
      );
      await createDefaultRoleWithoutPermission(prisma);
      const body = {
        ...defaultRole,
      };

      // Act
      const result = await request.post('/api/roles').set(headers).send(body);

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body).toEqual({
        error: 'Bad Request',
        message: ResponseErrorEnum.ROLE_ALREADY_EXISTS,
        statusCode: 400,
      });
    });

    it('should return status code 200 when role is created', async () => {
      // Arrange
      const { headers } = await getAuthenticatedUserWithRoles(
        prisma,
        bcrypt,
        jwt,
        'roles:create',
      );
      const body = {
        ...defaultRole,
      };

      // Act
      const result = await request.post('/api/roles').set(headers).send(body);

      // Assert
      expect(result.statusCode).toBe(201);
      expect(result.body).toHaveProperty('id');
      expect(result.body).toHaveProperty('createdAt');
      expect(result.body).toHaveProperty('updatedAt');
      expect(result.body).toEqual(
        expect.objectContaining({
          name: body.name,
          description: body.description,
        }),
      );

      // Check in Database
      const { id } = result.body as { id: string };
      const roleCreated = await prisma.role.findUniqueOrThrow({
        where: {
          id,
        },
      });
      expect(roleCreated.name).toEqual(body.name);
      expect(roleCreated.description).toEqual(body.description);
    });
  });
});
