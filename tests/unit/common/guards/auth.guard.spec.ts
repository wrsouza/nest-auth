import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../../../../src/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../../src/config';
import { Reflector } from '@nestjs/core';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Permission, Role, User } from '@prisma/client';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwt: JwtService;
  let prisma: PrismaService;
  let reflector: Reflector;

  const defaultUser = {
    id: 'id',
    name: 'name',
    email: 'email',
    password: 'hash-password',
    isAdmin: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [],
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUniqueOrThrow: jest.fn(),
            },
          },
        },
        {
          provide: Reflector,
          useValue: {},
        },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    jwt = module.get<JwtService>(JwtService);
    prisma = module.get<PrismaService>(PrismaService);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should all to be defined', () => {
    expect(authGuard).toBeDefined();
    expect(jwt).toBeDefined();
    expect(prisma).toBeDefined();
    expect(reflector).toBeDefined();
  });

  describe('mapperUser', () => {
    it('should map user roles to a flat array of permission names', () => {
      // Arrange
      const user = {
        ...defaultUser,
        roles: [
          {
            name: 'role-name',
            description: 'role-description',
            permissions: [
              {
                name: 'permission-name',
                description: 'permission-description',
              },
            ],
          },
        ],
      } as User & { roles: (Role & { permissions: Permission[] })[] };
      const expectedResult = {
        ...defaultUser,
        roles: ['permission-name'],
      };

      // Act
      const result = authGuard['mapperUser'](user);

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should return an empty roles array if user has no roles', () => {
      // Arrange
      const user = {
        ...defaultUser,
        roles: [],
      };
      const expectedResult = {
        ...defaultUser,
        roles: [],
      };

      // Act
      const result = authGuard['mapperUser'](user);

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should return an empty roles array if roles have no permissions', () => {
      // Arrange
      const user = {
        ...defaultUser,
        roles: [
          {
            id: 'role-id',
            name: 'role-name',
            description: 'role-description',
            createdAt: new Date(),
            updatedAt: new Date(),
            permissions: [],
          },
        ],
      };
      const expectedResult = {
        ...defaultUser,
        roles: [],
      };

      // Act
      const result = authGuard['mapperUser'](user);

      // Assert
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findUserAuthenticated', () => {
    it('should return an authenticated user with their roles and permissions', async () => {
      const expectedUser = {
        id: 'id',
        email: 'email',
        isActive: true,
        roles: [
          {
            id: 'role-id',
            name: 'role-name',
            description: 'role-description',
            permissions: [
              {
                id: 'permission-id',
                name: 'permission-name',
                description: 'permission-description',
              },
            ],
          },
        ],
      } as User & { roles: (Role & { permissions: Permission[] })[] };
      const id = 'valid-id';
      const email = 'valid-email';

      const findUniqueOrThrowSpy = jest
        .spyOn(prisma.user, 'findUniqueOrThrow')
        .mockResolvedValueOnce(expectedUser);

      const result = await authGuard['findUserAuthenticated'](id, email);

      expect(result).toEqual(expectedUser);
      expect(findUniqueOrThrowSpy).toHaveBeenCalledWith({
        where: {
          id,
          email,
          isActive: true,
        },
        include: {
          roles: {
            include: {
              permissions: true,
            },
          },
        },
      });
    });

    it('should throw an error if the user is not found', async () => {
      const id = 'invalid-id';
      const email = 'invalid-email';
      const findUniqueOrThrowSpy = jest
        .spyOn(prisma.user, 'findUniqueOrThrow')
        .mockImplementationOnce(() => {
          throw new InternalServerErrorException();
        });
      let expectedError: unknown;

      try {
        await authGuard['findUserAuthenticated'](id, email);
      } catch (err: unknown) {
        expectedError = err;
      }

      expect(expectedError).toBeInstanceOf(InternalServerErrorException);
      expect(findUniqueOrThrowSpy).toHaveBeenCalledWith({
        where: {
          id,
          email,
          isActive: true,
        },
        include: {
          roles: {
            include: {
              permissions: true,
            },
          },
        },
      });
    });
  });

  describe('validateUserRoles', () => {
    it.each([
      [
        'should return true if requiredRoles is empty',
        {
          user: {
            ...defaultUser,
            isAdmin: false,
            roles: [],
          },
          requiredRoles: [],
          expectedResult: true,
        },
      ],
      [
        'should return true if user is an admin',
        {
          user: {
            ...defaultUser,
            isAdmin: true,
            roles: [],
          },
          requiredRoles: [],
          expectedResult: true,
        },
      ],
      [
        'should return true if user has at least one required role',
        {
          user: {
            ...defaultUser,
            isAdmin: false,
            roles: ['list:users'],
          },
          requiredRoles: ['list:users'],
          expectedResult: true,
        },
      ],
    ])('%s', (_, data) => {
      // Arrange
      const { user, requiredRoles, expectedResult } = data;

      // Act
      const result = authGuard['validateUserRoles'](user, requiredRoles);

      // Assert
      expect(result).toBe(expectedResult);
    });

    it('should throw UnauthorizedException if user lacks required roles', () => {
      // Arrange
      const user = {
        ...defaultUser,
        isAdmin: false,
        roles: [],
      };
      const requiredRoles = ['list:users'];
      let expectedError: unknown;

      // Act
      try {
        authGuard['validateUserRoles'](user, requiredRoles);
      } catch (err: unknown) {
        expectedError = err;
      }

      // Assert
      expect(expectedError).toBeInstanceOf(UnauthorizedException);
    });
  });
});
