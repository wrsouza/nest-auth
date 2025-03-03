import supertest from 'supertest';
import { BaseSetup } from '../base-setup';
import { PrismaService } from '../../../src/config';
import { BcryptService } from '../../../src/common';
import {
  createDefaultUserWithoutRole,
  defaultUser,
} from '../users/users.testcases';

describe('Auth Sign In API', () => {
  const baseSetup: BaseSetup = new BaseSetup();
  let request: supertest.SuperAgentTest;
  let prisma: PrismaService;
  let bcrypt: BcryptService;

  beforeAll(async () => {
    await baseSetup.beforeAll();
    request = baseSetup.Request;
    prisma = baseSetup.Prisma;
    bcrypt = baseSetup.Bcrypt;
  });

  beforeEach(() => baseSetup.beforeEach());
  afterEach(() => baseSetup.afterEach());
  afterAll(() => baseSetup.afterAll());

  describe(`/auth (POST)`, () => {
    it('should return status code 400 when send empty body', async () => {
      // Arrange
      const body = {};

      // Act
      const result = await request.post('/api/auth').send(body);

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body).toEqual({
        error: 'Bad Request',
        message: ['email must be an email', 'password must be a string'],
        statusCode: 400,
      });
    });

    it('should return status code 400 when send credentials invalid', async () => {
      // Arrange
      const body = {
        email: 'email@domain.com',
        password: 'example',
      };

      // Act
      const result = await request.post('/api/auth').send(body);

      // Assert
      expect(result.statusCode).toBe(400);
      expect(result.body).toEqual({
        error: 'Bad Request',
        message: 'Invalid email or password',
        statusCode: 400,
      });
    });

    it('should return status code 200 when send credentials correctly', async () => {
      // Arrange
      const { userCreated } = await createDefaultUserWithoutRole(
        prisma,
        bcrypt,
      );
      const body = {
        email: defaultUser.email,
        password: defaultUser.password,
      };

      // Act
      const result = await request.post('/api/auth').send(body);

      // Assert
      expect(result.statusCode).toBe(200);
      expect(result.body).toHaveProperty('accessToken');
      expect(result.body).toEqual(
        expect.objectContaining({
          id: userCreated.id,
          name: userCreated.name,
          email: userCreated.email,
        }),
      );
    });
  });
});
