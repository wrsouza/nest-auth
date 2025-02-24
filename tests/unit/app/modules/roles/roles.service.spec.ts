import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from '../../../../../src/app/modules/roles/roles.service';
import {
  PermissionRepository,
  RoleRepository,
} from '../../../../../src/app/repositories';
import { Permission, Role } from '@prisma/client';
import { RoleResponseDto } from '../../../../../src/app/modules/roles/dtos';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ResponseErrorEnum } from '../../../../../src/common';

describe('RolesService', () => {
  let service: RolesService;
  let repository: RoleRepository;

  const defaultRole = {
    id: 'id',
    name: 'name',
    description: 'description',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: RoleRepository,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            createOne: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
        {
          provide: PermissionRepository,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<RolesService>(RolesService);
    repository = module.get<RoleRepository>(RoleRepository);
  });

  it('should all to be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should list roles', async () => {
      // Arrange
      const expectedResult = [defaultRole];
      const findAllSpy = jest
        .spyOn(repository, 'findAll')
        .mockResolvedValueOnce(expectedResult);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(
        result.map((role) => new RoleResponseDto(role as Role)),
      );
      expect(findAllSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('createOne', () => {
    const data = {
      name: 'new-name',
      description: 'new-description',
    };
    it('should create a role', async () => {
      // Arrange
      const role = {
        ...defaultRole,
      };
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(null);
      const createOneSpy = jest
        .spyOn(repository, 'createOne')
        .mockResolvedValueOnce(role as Role);

      // Act
      const result = await service.createOne(data);

      // Assert
      expect(result).toEqual(new RoleResponseDto(result as Role));
      expect(findOneSpy).toHaveBeenCalledWith({ name: data.name });
      expect(createOneSpy).toHaveBeenCalledWith(data);
    });

    it('should throw BadRequestException when found a role registered', async () => {
      // Arrange
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce({} as Role & { permissions: Permission[] });
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
          ResponseErrorEnum.ROLE_ALREADY_EXISTS,
        );
      }
      expect(findOneSpy).toHaveBeenCalledWith({ name: data.name });
    });
  });

  describe('findOne', () => {
    const id = 'find-id';

    it('should find a role', async () => {
      // Arrange
      const role = {
        ...defaultRole,
        permissions: [],
      } as Role;
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(role as Role & { permissions: Permission[] });

      // Act
      const result = await service.findOne(id);

      // Assert
      expect(result).toEqual(new RoleResponseDto(result as Role));
      expect(findOneSpy).toHaveBeenCalledWith({ id });
    });

    it('should throw NotFoundException when not found a role', async () => {
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
      expect(expectedResult).toBeInstanceOf(NotFoundException);
      if (expectedResult instanceof NotFoundException) {
        expect(expectedResult.message).toEqual(
          ResponseErrorEnum.ROLE_NOT_FOUND,
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
    it('should update a role', async () => {
      // Arrange
      const role = {
        ...defaultRole,
      } as Role & { permissions: Permission[] };
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(role);
      const updateOneSpy = jest
        .spyOn(repository, 'updateOne')
        .mockResolvedValueOnce(role);

      // Act
      const result = await service.updateOne(id, data);

      // Assert
      expect(result).toEqual(new RoleResponseDto(result as Role));
      expect(findOneSpy).toHaveBeenCalledWith({ id });
      expect(updateOneSpy).toHaveBeenCalledWith({ id }, data);
    });

    it('should throw NotFoundException when not found a role', async () => {
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
      expect(expectedResult).toBeInstanceOf(NotFoundException);
      if (expectedResult instanceof NotFoundException) {
        expect(expectedResult.message).toEqual(
          ResponseErrorEnum.ROLE_NOT_FOUND,
        );
      }
      expect(findOneSpy).toHaveBeenCalledWith({ id });
    });
  });

  describe('deleteOne', () => {
    const id = 'remove-id';
    it('should delete a role', async () => {
      // Arrange
      const role = {} as Role & { permissions: Permission[] };
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(role);
      const deleteOneSpy = jest.spyOn(repository, 'deleteOne');

      // Act
      await service.deleteOne(id);

      // Assert
      expect(findOneSpy).toHaveBeenCalledWith({ id });
      expect(deleteOneSpy).toHaveBeenCalledWith({ id });
    });

    it('should throw NotFoundException when not found a role', async () => {
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
      expect(expectedResult).toBeInstanceOf(NotFoundException);
      if (expectedResult instanceof NotFoundException) {
        expect(expectedResult.message).toEqual(
          ResponseErrorEnum.ROLE_NOT_FOUND,
        );
      }
      expect(findOneSpy).toHaveBeenCalledWith({ id });
    });
  });
});
