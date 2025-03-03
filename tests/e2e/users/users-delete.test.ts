import supertest from 'supertest';
import { BaseSetup } from '../base-setup';
import { PrismaService } from '../../../src/config';
import { JwtService } from '@nestjs/jwt';
import { BcryptService } from '../../../src/common';

describe('Users Delete Api', () => {
  const baseSetup: BaseSetup = new BaseSetup();
  let request: supertest.SuperAgentTest;
  let prisma: PrismaService;
  let bcrypt: BcryptService;
  let jwt: JwtService;

  const defaultUser = {
    name: 'User Authenticated',
    email: 'user@domain.com',
    password: 'example',
    isActive: true,
    isAdmin: false,
  };

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
      const user = await prisma.user.create({
        data: {
          ...defaultUser,
          password: bcrypt.hash('example'),
        },
      });
      const payload = { sub: user.id, email: user.email };
      const accessToken = await jwt.signAsync(payload);
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
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
      const user = await prisma.user.create({
        data: {
          ...defaultUser,
          password: bcrypt.hash('example'),
          roles: {
            create: {
              name: 'users role',
              description: 'users role',
              permissions: {
                create: {
                  name: 'users:delete',
                  description: 'delete users',
                },
              },
            },
          },
        },
      });
      const payload = { sub: user.id, email: user.email };
      const accessToken = await jwt.signAsync(payload);
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const body = {
        ...defaultUser,
      };
      const id = '19acb732-0afd-49d2-9db7-a43ae9120479';

      // Act
      const result = await request
        .delete(`/api/users/${id}`)
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

    it('should return status code 204 and delete a user', async () => {
      // Arrange
      const userToDelete = await prisma.user.create({
        data: {
          name: 'John Doe',
          email: 'john.doe@domain.com',
          password: bcrypt.hash('example'),
          isActive: true,
          isAdmin: true,
        },
      });
      const user = await prisma.user.create({
        data: {
          ...defaultUser,
          password: bcrypt.hash('example'),
          roles: {
            create: {
              name: 'users role',
              description: 'users role',
              permissions: {
                create: {
                  name: 'users:delete',
                  description: 'delete users',
                },
              },
            },
          },
        },
      });
      const payload = { sub: user.id, email: user.email };
      const accessToken = await jwt.signAsync(payload);
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const body = {
        ...defaultUser,
      };
      const id = userToDelete.id;

      // Act
      const result = await request
        .delete(`/api/users/${id}`)
        .set(headers)
        .send(body);

      // Assert
      expect(result.statusCode).toBe(204);
      expect(result.body).toEqual({});

      const userDeleted = await prisma.user.findUnique({ where: { id } });
      expect(userDeleted).toBeNull();
    });
  });
});
