import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard, Roles } from '../../../../src/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../../src/config';
import { Reflector } from '@nestjs/core';
import {
  InternalServerErrorException,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { Permission, Role, User } from '@prisma/client';
import { ProfileResponseDto } from '../../../../src/app/modules/auth/dto';

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
          useValue: {
            verifyAsync: jest.fn(),
          },
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
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    jwt = module.get<JwtService>(JwtService);
    prisma = module.get<PrismaService>(PrismaService);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should all to be defined', () => {
    expect(authGuard).toBeDefined();
    expect(jwt).toBeDefined();
    expect(prisma).toBeDefined();
    expect(reflector).toBeDefined();
  });

  describe('canActivate', () => {
    const mockRequest = {};
    const mockContext = {
      switchToHttp: jest
        .fn()
        .mockReturnValue({ getRequest: () => mockRequest }),
      getHandler: jest.fn(),
    };
    it('should return true when authentication and role validation pass', async () => {
      // Arrange
      const user = {
        ...defaultUser,
        isAdmin: true,
      };
      const accessToken = 'valid-token';
      const expectedPayload = { sub: user.id, email: user.email };
      const requiredRoles = ['list:users'];
      const getReflectorSpy = jest
        .spyOn(reflector, 'get')
        .mockReturnValue(requiredRoles);
      const extractTokenFromHeaderSpy = jest
        .spyOn(authGuard as any, 'extractTokenFromHeader')
        .mockReturnValueOnce(accessToken);
      const validatePayloadSpy = jest
        .spyOn(authGuard as any, 'validatePayload')
        .mockResolvedValueOnce(expectedPayload);

      const validateUserAuthenticatedSpy = jest
        .spyOn(authGuard as any, 'validateUserAuthenticated')
        .mockResolvedValueOnce(user);

      const validateUserRoles = jest
        .spyOn(authGuard as any, 'validateUserRoles')
        .mockReturnValueOnce(true);

      // Act
      const result = await authGuard.canActivate(
        mockContext as unknown as ExecutionContext,
      );

      // Assert
      expect(result).toBe(true);
      expect(mockRequest['user']).toEqual(new ProfileResponseDto(user));
      expect(getReflectorSpy).toHaveBeenCalledTimes(1);
      expect(getReflectorSpy).toHaveBeenCalledWith(
        Roles,
        mockContext.getHandler(),
      );
      expect(extractTokenFromHeaderSpy).toHaveBeenCalledTimes(1);
      expect(extractTokenFromHeaderSpy).toHaveBeenCalledWith(mockRequest);
      expect(validatePayloadSpy).toHaveBeenCalledTimes(1);
      expect(validatePayloadSpy).toHaveBeenCalledWith(accessToken);
      expect(validateUserAuthenticatedSpy).toHaveBeenCalledWith(
        expectedPayload,
      );
      expect(validateUserRoles).toHaveBeenCalledWith(user, requiredRoles);
    });

    it('should return false if token extraction fails', async () => {
      // Arrange
      const requiredRoles = ['list:users'];
      jest.spyOn(reflector, 'get').mockReturnValue(requiredRoles);

      const extractTokenFromHeaderSpy = jest
        .spyOn(authGuard as any, 'extractTokenFromHeader')
        .mockImplementationOnce(() => {
          throw new UnauthorizedException();
        });

      // Act
      const result = await authGuard.canActivate(
        mockContext as unknown as ExecutionContext,
      );

      // Assert
      expect(result).toBeFalsy();
      expect(extractTokenFromHeaderSpy).toHaveBeenCalledWith(mockRequest);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should return the token when a valid Bearer token is provided', () => {
      // Arrange
      const expectedToken = 'valid-token';
      const request = {
        headers: {
          authorization: `Bearer ${expectedToken}`,
        },
      } as unknown as Request;

      // Act
      const token = authGuard['extractTokenFromHeader'](request);

      // Assert
      expect(token).toBe(expectedToken);
    });

    it.each([
      [
        'should throw UnauthorizedException if the authorization header is missing',
        {
          headers: {},
        } as Request,
      ],
      [
        'should throw UnauthorizedException if the authorization header is not in Bearer format',
        {
          headers: {
            authorization: 'Basic some-token',
          },
        } as unknown as Request,
      ],
    ])('%s', (_, request) => {
      // Arrange
      let expectedError: unknown;

      // Act
      try {
        authGuard['extractTokenFromHeader'](request);
      } catch (err) {
        expectedError = err;
      }

      // Assert
      expect(expectedError).toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('validatePayload', () => {
    it('should validate the token and return the payload', async () => {
      // Arrange
      const accessToken = 'valid-token';
      const expectedPayload = {
        sub: defaultUser.id,
        email: defaultUser.email,
      };
      const verifyAsyncSpy = jest
        .spyOn(jwt, 'verifyAsync')
        .mockResolvedValueOnce(expectedPayload);

      // Act
      const result = await authGuard['validatePayload'](accessToken);

      // Assert
      expect(result).toEqual(expectedPayload);
      expect(verifyAsyncSpy).toHaveBeenCalledWith(accessToken);
    });

    it('should throw a error when the token is invalid', async () => {
      // Arrange
      const accessToken = 'invalid-token';
      const verifyAsyncSpy = jest
        .spyOn(jwt, 'verifyAsync')
        .mockImplementationOnce(() => {
          throw new InternalServerErrorException();
        });
      let expectedError: unknown;

      // Act
      try {
        await authGuard['validatePayload'](accessToken);
      } catch (err: unknown) {
        expectedError = err;
      }

      // Assert
      expect(expectedError).toBeInstanceOf(InternalServerErrorException);
      expect(verifyAsyncSpy).toHaveBeenCalledWith(accessToken);
    });
  });

  describe('validateUserAuthenticated', () => {
    it('should return a user with roles', async () => {
      // Arrange
      const payload = { sub: '123', email: 'test@example.com' };
      const user = {
        ...defaultUser,
        roles: [],
      };
      const findUserAuthenticatedSpy = jest
        .spyOn(authGuard as any, 'findUserAuthenticated')
        .mockResolvedValueOnce(user);
      const mapperUserSpy = jest
        .spyOn(authGuard as any, 'mapperUser')
        .mockReturnValueOnce(user);

      // Act
      const result = await authGuard['validateUserAuthenticated'](payload);

      // Assert
      expect(result).toEqual(user);
      expect(findUserAuthenticatedSpy).toHaveBeenCalledWith(
        payload.sub,
        payload.email,
      );
      expect(mapperUserSpy).toHaveBeenCalledWith(user);
    });
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
