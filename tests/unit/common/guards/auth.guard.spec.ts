import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../../../../src/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../../src/config';
import { Reflector } from '@nestjs/core';
import { UnauthorizedException } from '@nestjs/common';

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
          useValue: {},
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
