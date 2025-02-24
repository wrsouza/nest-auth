import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../../../../src/app/modules/users/users.controller';
import { UsersService } from '../../../../../src/app/modules/users/users.service';
import { AuthGuard } from '../../../../../src/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../../../src/config';
import { UserResponseDto } from '../../../../../src/app/modules/users/dtos';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            createOne: jest.fn(),
            findOne: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
            updateRoles: jest.fn(),
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

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should all to be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should find all users', async () => {
      // Arrange
      const expectedResult = [] as UserResponseDto[];
      const findAllSpy = jest
        .spyOn(service, 'findAll')
        .mockResolvedValueOnce(expectedResult);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(expectedResult);
      expect(findAllSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('createOne', () => {
    it('should create a user', async () => {
      // Arrange
      const data = {
        name: 'new-name',
        email: 'new-description',
        password: 'new-password',
        isActive: true,
        isAdmin: false,
      };
      const expectedResult = {} as UserResponseDto;
      const createOneSpy = jest
        .spyOn(service, 'createOne')
        .mockResolvedValueOnce(expectedResult);

      // Act
      const result = await controller.createOne(data);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(createOneSpy).toHaveBeenCalledWith(data);
    });
  });

  describe('findOne', () => {
    it('should find a user', async () => {
      // Arrange
      const id = 'update-id';
      const expectedResult = {} as UserResponseDto;
      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(expectedResult);

      // Act
      const result = await controller.findOne(id);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(findOneSpy).toHaveBeenCalledWith(id);
    });
  });

  describe('updateOne', () => {
    it('should update a user', async () => {
      // Arrange
      const id = 'update-id';
      const data = {
        name: 'update-name',
        email: 'update-email',
        password: 'update-password',
        isActive: true,
        isAdmin: false,
      };
      const expectedResult = {} as UserResponseDto;
      const updateOneSpy = jest
        .spyOn(service, 'updateOne')
        .mockResolvedValueOnce(expectedResult);

      // Act
      const result = await controller.updateOne(id, data);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(updateOneSpy).toHaveBeenCalledWith(id, data);
    });
  });

  describe('deleteOne', () => {
    it('should delete a user', async () => {
      // Arrange
      const id = 'remove-id';
      const deleteOneSpy = jest.spyOn(service, 'deleteOne');

      // Act
      const result = await controller.deleteOne(id);

      // Assert
      expect(result).toBeUndefined();
      expect(deleteOneSpy).toHaveBeenCalledWith(id);
    });
  });

  describe('updateRoles', () => {
    it('should update roles from user', async () => {
      // Arrange
      const id = 'updated-id';
      const body = {
        roles: ['updated-role'],
      };
      const expectedResult = {} as UserResponseDto;
      const updateRolesSpy = jest
        .spyOn(service, 'updateRoles')
        .mockResolvedValueOnce(expectedResult);

      // Act
      const result = await controller.updateRoles(id, body);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(updateRolesSpy).toHaveBeenCalledWith(id, body.roles);
    });
  });
});
