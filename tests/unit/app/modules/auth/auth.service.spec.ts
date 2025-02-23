/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../../../../src/app/repositories';
import { BcryptService, ResponseErrorEnum } from '../../../../../src/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../../../../src/app/modules/auth/auth.service';
import { BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthResponseDto } from '../../../../../src/app/modules/auth/dto';

describe('AuthService', () => {
  let service: AuthService;
  let repository: UserRepository;
  let bcrypt: BcryptService;
  let jwt: JwtService;

  const defaultUser = {
    id: 'id',
    name: 'name',
    email: 'email',
    password: 'hash-password',
    isAdmin: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [] as Role[],
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: BcryptService,
          useValue: {
            compare: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    repository = module.get<UserRepository>(UserRepository);
    bcrypt = module.get<BcryptService>(BcryptService);
    jwt = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should all be defined', () => {
    // Assert
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
    expect(bcrypt).toBeDefined();
    expect(jwt).toBeDefined();
  });

  describe('signIn', () => {
    it('should call signIn method and return a user with access token', async () => {
      // Arrange
      const body = {
        email: 'valid-email',
        password: 'valid-password',
      };
      const expectedToken = 'access-token';
      const getUserByEmailSpy = jest
        .spyOn(service as any, 'getUserByEmail')
        .mockResolvedValueOnce(defaultUser);
      const checkPasswordIsValidSpy = jest
        .spyOn(service as any, 'checkPasswordIsValid')
        .mockReturnValueOnce(true);
      const signAsyncSpy = jest
        .spyOn(jwt, 'signAsync')
        .mockResolvedValueOnce(expectedToken);

      // Act
      const result = await service.signIn(body);

      // Assert
      expect(result).toEqual(new AuthResponseDto(defaultUser, expectedToken));
      expect(getUserByEmailSpy).toHaveBeenCalledTimes(1);
      expect(getUserByEmailSpy).toHaveBeenCalledWith(body.email);
      expect(checkPasswordIsValidSpy).toHaveBeenCalledTimes(1);
      expect(checkPasswordIsValidSpy).toHaveBeenCalledWith(
        body.password,
        defaultUser.password,
      );
      expect(signAsyncSpy).toHaveBeenCalledTimes(1);
      expect(signAsyncSpy).toHaveBeenCalledWith({
        sub: defaultUser.id,
        email: defaultUser.email,
      });
    });

    it('should throw a BadRequest exception when email or password is invalid', async () => {
      // Arrange
      const body = {
        email: 'invalid-email',
        password: 'invalid-password',
      };
      const getUserByEmailSpy = jest
        .spyOn(service as any, 'getUserByEmail')
        .mockRejectedValueOnce(
          new BadRequestException(ResponseErrorEnum.AUTH_INVALID),
        );
      let expectedError: unknown;

      // Act
      try {
        await service.signIn(body);
      } catch (err: unknown) {
        expectedError = err;
      }

      // Assert
      expect(expectedError).toBeInstanceOf(BadRequestException);
      expect(getUserByEmailSpy).toHaveBeenCalledTimes(1);
      expect(getUserByEmailSpy).toHaveBeenCalledWith(body.email);
    });

    it('should throw a BadRequest exception when password is invalid', async () => {
      // Arrange
      const body = {
        email: 'valid-email',
        password: 'invalid-password',
      };
      const getUserByEmailSpy = jest
        .spyOn(service as any, 'getUserByEmail')
        .mockResolvedValueOnce(defaultUser);
      const checkPasswordIsValidSpy = jest
        .spyOn(service as any, 'checkPasswordIsValid')
        .mockImplementationOnce(() => {
          throw new BadRequestException(ResponseErrorEnum.AUTH_INVALID);
        });
      let expectedError: unknown;

      // Act
      try {
        await service.signIn(body);
      } catch (err: unknown) {
        expectedError = err;
      }

      // Assert
      expect(expectedError).toBeInstanceOf(BadRequestException);
      expect(getUserByEmailSpy).toHaveBeenCalledTimes(1);
      expect(getUserByEmailSpy).toHaveBeenCalledWith(body.email);
      expect(checkPasswordIsValidSpy).toHaveBeenCalledTimes(1);
      expect(checkPasswordIsValidSpy).toHaveBeenCalledWith(
        body.password,
        defaultUser.password,
      );
    });
  });

  describe('getUserByEmail', () => {
    it('should call getUserByEmail method and a user', async () => {
      // Arrange
      const email = 'valid-email';
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(defaultUser);

      // Act
      const result = await (service as any).getUserByEmail(email);

      // Assert
      expect(result).toEqual(defaultUser);
      expect(findOneSpy).toHaveBeenCalledTimes(1);
      expect(findOneSpy).toHaveBeenCalledWith({ email, isActive: true });
    });

    it('should throw a BadRequest exception when the email is not found', async () => {
      // Arrange
      const email = 'notfound-email';
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(null);

      let expectedError: unknown;

      // Act
      try {
        await (service as any).getUserByEmail(email);
      } catch (err: unknown) {
        expectedError = err;
      }

      // Assert
      expect(expectedError).toBeInstanceOf(BadRequestException);
      if (expectedError instanceof BadRequestException) {
        expect(expectedError.message).toEqual(ResponseErrorEnum.AUTH_INVALID);
      }
      expect(findOneSpy).toHaveBeenCalledTimes(1);
      expect(findOneSpy).toHaveBeenCalledWith({ email, isActive: true });
    });
  });

  describe('checkPasswordIsValid', () => {
    it('should call checkPasswordIsValid method and nothing return', () => {
      // Arrange
      const password = 'valid-password';
      const hashPassword = 'hash-password';

      const compareSpy = jest
        .spyOn(bcrypt, 'compare')
        .mockReturnValueOnce(true);

      // Act
      (service as any).checkPasswordIsValid(password, hashPassword);

      // Assert
      expect(compareSpy).toHaveBeenCalledTimes(1);
      expect(compareSpy).toHaveBeenCalledWith(password, hashPassword);
    });

    it('should throw a BadRequest exception when the password is not compatible', () => {
      // Arrange
      const password = 'invalid-password';
      const hashPassword = 'hash-password';

      const compareSpy = jest
        .spyOn(bcrypt, 'compare')
        .mockReturnValueOnce(false);

      let expectedError: unknown;
      // Act
      try {
        (service as any).checkPasswordIsValid(password, hashPassword);
      } catch (err: unknown) {
        expectedError = err;
      }

      // Assert
      expect(expectedError).toBeInstanceOf(BadRequestException);
      if (expectedError instanceof BadRequestException) {
        expect(expectedError.message).toEqual(ResponseErrorEnum.AUTH_INVALID);
      }
      expect(compareSpy).toHaveBeenCalledTimes(1);
      expect(compareSpy).toHaveBeenCalledWith(password, hashPassword);
    });
  });
});
