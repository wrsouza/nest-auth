import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from '../../../../../src/app/modules/auth/auth.controller';
import { AuthService } from '../../../../../src/app/modules/auth/auth.service';
import { AuthGuard } from '../../../../../src/common';
import { PrismaService } from '../../../../../src/config';
import {
  AuthRequestDto,
  AuthResponseDto,
  AuthSignInDto,
  ProfileResponseDto,
} from '../../../../../src/app/modules/auth/dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn(),
          },
        },
        {
          provide: AuthGuard,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should all be defined', () => {
    // Assert
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return a user when call the getProfile method', () => {
      // Arrange
      const req = {
        user: {} as ProfileResponseDto,
      } as AuthRequestDto;

      // Act
      const result = controller.getProfile(req);

      // Assert
      expect(result).toEqual({});
    });
  });

  describe('signIn', () => {
    it('should return call signIn method from service and pass login data', async () => {
      // Arrange
      const expectedPayload = {
        id: 'id',
        name: 'name',
        email: 'email',
        accessToken: 'access-token',
      } as AuthResponseDto;

      const payload = {
        email: 'valid-email',
        password: 'valid-password',
      } as AuthSignInDto;

      const signInSpy = jest
        .spyOn(service, 'signIn')
        .mockResolvedValueOnce(expectedPayload);

      // Act
      const result = await controller.signIn(payload);

      // Assert
      expect(result).toEqual(expectedPayload);
      expect(signInSpy).toHaveBeenCalledWith(payload);
    });
  });
});
