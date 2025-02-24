import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from '../../../../../src/app/modules/permissions/permissions.service';
import { PermissionRepository } from '../../../../../src/app/repositories';
import { Permission } from '@prisma/client';
import { PermissionResponseDto } from '../../../../../src/app/modules/permissions/dtos';
import { BadRequestException } from '@nestjs/common';
import { ResponseErrorEnum } from '../../../../../src/common';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let repository: PermissionRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: PermissionRepository,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            createOne: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<PermissionsService>(PermissionsService);
    repository = module.get<PermissionRepository>(PermissionRepository);
  });

  it('should all to be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should list permissions', async () => {
      // Arrange
      const expectedResult = [
        {
          id: 'id',
          name: 'name',
          description: 'description',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const findAllSpy = jest
        .spyOn(repository, 'findAll')
        .mockResolvedValueOnce(expectedResult);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(
        result.map((permission) => new PermissionResponseDto(permission)),
      );
      expect(findAllSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('createOne', () => {
    const data = {
      name: 'new-name',
      description: 'new-description',
    };
    const permission = {} as Permission;
    it('should create a permission', async () => {
      // Arrange
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(null);
      const createOneSpy = jest
        .spyOn(repository, 'createOne')
        .mockResolvedValueOnce(permission);

      // Act
      const result = await service.createOne(data);

      // Assert
      expect(result).toEqual(new PermissionResponseDto(result));
      expect(findOneSpy).toHaveBeenCalledWith({ name: data.name });
      expect(createOneSpy).toHaveBeenCalledWith(data);
    });

    it('should throw BadRequestException when found a permission registered', async () => {
      // Arrange
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce({} as Permission);
      let expectedResult: unknown;

      // Act
      try {
        await service.createOne(data);
      } catch (err: unknown) {
        expectedResult = err;
      }

      // Assert
      expect(expectedResult).toBeInstanceOf(BadRequestException);
      if (expectedResult instanceof BadRequestException) {
        expect(expectedResult.message).toEqual(
          ResponseErrorEnum.PERMISSION_ALREADY_EXISTS,
        );
      }
      expect(findOneSpy).toHaveBeenCalledWith({ name: data.name });
    });
  });

  describe('findOne', () => {
    const id = 'find-id';

    it('should find a permission', async () => {
      // Arrange
      const permission = {} as Permission;
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(permission);

      // Act
      const result = await service.findOne(id);

      // Assert
      expect(result).toEqual(new PermissionResponseDto(result));
      expect(findOneSpy).toHaveBeenCalledWith({ id });
    });

    it('should throw BadRequestException when not found a permission', async () => {
      // Arrange
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(null);
      let expectedResult: unknown;

      // Act
      try {
        await service.findOne(id);
      } catch (err: unknown) {
        expectedResult = err;
      }

      // Assert
      expect(expectedResult).toBeInstanceOf(BadRequestException);
      if (expectedResult instanceof BadRequestException) {
        expect(expectedResult.message).toEqual(
          ResponseErrorEnum.PERMISSION_NOT_FOUND,
        );
      }
      expect(findOneSpy).toHaveBeenCalledWith({ id });
    });
  });

  describe('updateOne', () => {
    const id = 'updated-id';
    const data = {
      name: 'updated-name',
      description: 'updated-description',
    };
    it('should update a permission', async () => {
      // Arrange
      const permission = {} as Permission;
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(permission);
      const updateOneSpy = jest
        .spyOn(repository, 'updateOne')
        .mockResolvedValueOnce(permission);

      // Act
      const result = await service.updateOne(id, data);

      // Assert
      expect(result).toEqual(new PermissionResponseDto(result));
      expect(findOneSpy).toHaveBeenCalledWith({ id });
      expect(updateOneSpy).toHaveBeenCalledWith({ id }, data);
    });

    it('should throw BadRequestException when not found a permission', async () => {
      // Arrange
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(null);
      let expectedResult: unknown;

      // Act
      try {
        await service.updateOne(id, data);
      } catch (err: unknown) {
        expectedResult = err;
      }

      // Assert
      expect(expectedResult).toBeInstanceOf(BadRequestException);
      if (expectedResult instanceof BadRequestException) {
        expect(expectedResult.message).toEqual(
          ResponseErrorEnum.PERMISSION_NOT_FOUND,
        );
      }
      expect(findOneSpy).toHaveBeenCalledWith({ id });
    });
  });

  describe('deleteOne', () => {
    const id = 'remove-id';
    it('should delete a permission', async () => {
      // Arrange
      const permission = {} as Permission;
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(permission);
      const deleteOneSpy = jest.spyOn(repository, 'deleteOne');

      // Act
      await service.deleteOne(id);

      // Assert
      expect(findOneSpy).toHaveBeenCalledWith({ id });
      expect(deleteOneSpy).toHaveBeenCalledWith({ id });
    });

    it('should throw BadRequestException when not found a permission', async () => {
      // Arrange
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(null);
      let expectedResult: unknown;

      // Act
      try {
        await service.deleteOne(id);
      } catch (err: unknown) {
        expectedResult = err;
      }

      // Assert
      expect(expectedResult).toBeInstanceOf(BadRequestException);
      if (expectedResult instanceof BadRequestException) {
        expect(expectedResult.message).toEqual(
          ResponseErrorEnum.PERMISSION_NOT_FOUND,
        );
      }
      expect(findOneSpy).toHaveBeenCalledWith({ id });
    });
  });
});
