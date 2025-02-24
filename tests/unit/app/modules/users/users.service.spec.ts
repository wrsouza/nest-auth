import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../../../src/app/modules/users/users.service';
import {
  RoleRepository,
  UserRepository,
} from '../../../../../src/app/repositories';
import { Role, User } from '@prisma/client';
import { UserResponseDto } from '../../../../../src/app/modules/users/dtos';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BcryptService, ResponseErrorEnum } from '../../../../../src/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UserRepository;
  let roleRepository: RoleRepository;
  let bcrypt: BcryptService;

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
  } as User & { roles: Role[] };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            createOne: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
            disconectRoles: jest.fn(),
            connectRoles: jest.fn(),
          },
        },
        {
          provide: RoleRepository,
          useValue: {
            findAll: jest.fn(),
          },
        },
        {
          provide: BcryptService,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    repository = module.get<UserRepository>(UserRepository);
    roleRepository = module.get<RoleRepository>(RoleRepository);
    bcrypt = module.get<BcryptService>(BcryptService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should all to be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
    expect(roleRepository).toBeDefined();
    expect(bcrypt).toBeDefined();
  });

  describe('findAll', () => {
    it('should list users', async () => {
      // Arrange
      const expectedResult = [defaultUser];
      const findAllSpy = jest
        .spyOn(repository, 'findAll')
        .mockResolvedValueOnce(expectedResult);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(
        result.map((user) => new UserResponseDto(user as User)),
      );
      expect(findAllSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('createOne', () => {
    const data = {
      name: 'name',
      email: 'email',
      password: 'password',
      isAdmin: false,
      isActive: true,
    };

    it('should create a user', async () => {
      // Arrange
      const user = {
        ...defaultUser,
      };
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(null);
      const createOneSpy = jest
        .spyOn(repository, 'createOne')
        .mockResolvedValueOnce(user as User);
      const bcryptHashSpy = jest
        .spyOn(bcrypt, 'hash')
        .mockReturnValueOnce('hash-password');

      // Act
      const result = await service.createOne(data);

      // Assert
      expect(result).toEqual(new UserResponseDto(result as User));
      expect(findOneSpy).toHaveBeenCalledWith({ email: data.email });
      expect(createOneSpy).toHaveBeenCalledWith(data);
      expect(bcryptHashSpy).toHaveBeenCalledWith('password');
    });

    it('should throw BadRequestException when found a user registered', async () => {
      // Arrange
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce({} as User & { roles: Role[] });
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
          ResponseErrorEnum.USER_ALREADY_EXISTS,
        );
      }
      expect(findOneSpy).toHaveBeenCalledWith({ email: data.email });
    });
  });

  describe('findOne', () => {
    const id = 'find-id';

    it('should find a user', async () => {
      // Arrange
      const user = {
        ...defaultUser,
        roles: [],
      } as User;
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(user as User & { roles: Role[] });

      // Act
      const result = await service.findOne(id);

      // Assert
      expect(result).toEqual(new UserResponseDto(result as User));
      expect(findOneSpy).toHaveBeenCalledWith({ id });
    });

    it('should throw NotFoundException when not found a user', async () => {
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
          ResponseErrorEnum.USER_NOT_FOUND,
        );
      }
      expect(findOneSpy).toHaveBeenCalledWith({ id });
    });
  });

  describe('updateOne', () => {
    const id = 'updated-id';
    const data = {
      name: 'updated-name',
      email: 'updated-email',
      password: 'updated-password',
      isAdmin: false,
      isActive: true,
    };
    it('should update a user', async () => {
      // Arrange
      const user = {
        ...defaultUser,
      } as User & { roles: Role[] };
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(user);
      const updateOneSpy = jest
        .spyOn(repository, 'updateOne')
        .mockResolvedValueOnce(user);
      const bcryptHashSpy = jest
        .spyOn(bcrypt, 'hash')
        .mockReturnValueOnce('hash-password');

      // Act
      const result = await service.updateOne(id, data);

      // Assert
      expect(result).toEqual(new UserResponseDto(result as User));
      expect(findOneSpy).toHaveBeenCalledWith({ id });
      expect(updateOneSpy).toHaveBeenCalledWith({ id }, data);
      expect(bcryptHashSpy).toHaveBeenCalledWith('updated-password');
    });

    it('should throw NotFoundException when not found a user', async () => {
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
          ResponseErrorEnum.USER_NOT_FOUND,
        );
      }
      expect(findOneSpy).toHaveBeenCalledWith({ id });
    });
  });

  describe('deleteOne', () => {
    const id = 'remove-id';
    it('should delete a user', async () => {
      // Arrange
      const user = {} as User & { roles: Role[] };
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(user);
      const deleteOneSpy = jest.spyOn(repository, 'deleteOne');

      // Act
      await service.deleteOne(id);

      // Assert
      expect(findOneSpy).toHaveBeenCalledWith({ id });
      expect(deleteOneSpy).toHaveBeenCalledWith({ id });
    });

    it('should throw NotFoundException when not found a user', async () => {
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
          ResponseErrorEnum.USER_NOT_FOUND,
        );
      }
      expect(findOneSpy).toHaveBeenCalledWith({ id });
    });
  });

  describe('updateRoles', () => {
    it('should throw BadRequestException if user is not found', async () => {
      const id = 'update-id';
      const roles = ['updated-role'];
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(null);
      let expectedError: unknown;

      try {
        await service.updateRoles(id, roles);
      } catch (err: unknown) {
        expectedError = err;
      }

      expect(expectedError).toBeInstanceOf(NotFoundException);
      if (expectedError instanceof NotFoundException) {
        expect(expectedError.message).toEqual(ResponseErrorEnum.USER_NOT_FOUND);
      }
      expect(findOneSpy).toHaveBeenCalledWith({ id });
    });

    it('should throw BadRequestException if some roles are not found', async () => {
      const id = 'update-id';
      const roles = ['updated-role'];
      const user = {
        ...defaultUser,
        roles: [],
      };
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(user);
      const findAllSpy = jest
        .spyOn(roleRepository, 'findAll')
        .mockResolvedValueOnce([]);

      let expectedError: unknown;

      try {
        await service.updateRoles(id, roles);
      } catch (err: unknown) {
        expectedError = err;
      }

      expect(expectedError).toBeInstanceOf(NotFoundException);
      if (expectedError instanceof NotFoundException) {
        expect(expectedError.message).toEqual(ResponseErrorEnum.ROLE_NOT_FOUND);
      }
      expect(findOneSpy).toHaveBeenCalledWith({ id });
      expect(findAllSpy).toHaveBeenCalledWith({
        id: { in: roles },
      });
    });

    it('should disconnect previous roles if they exist', async () => {
      // Arrange
      const id = 'update-id';
      const roles = [];
      const user = {
        ...defaultUser,
        roles: [{ id: 'old-role' }] as Role[],
      };
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(user);
      const findAllSpy = jest
        .spyOn(roleRepository, 'findAll')
        .mockResolvedValueOnce([]);
      const disconectRolesSpy = jest
        .spyOn(repository, 'disconectRoles')
        .mockResolvedValueOnce(user);

      // Act
      const result = await service.updateRoles(id, roles);

      // Assert
      expect(result).toEqual(
        new UserResponseDto({ ...defaultUser, roles: [] }),
      );
      expect(findOneSpy).toHaveBeenCalledWith({ id });
      expect(findAllSpy).toHaveBeenCalledWith({
        id: { in: roles },
      });
      expect(disconectRolesSpy).toHaveBeenCalledWith({ id }, [
        { id: 'old-role' },
      ]);
    });

    it('should connect new roles if provided', async () => {
      // Arrange
      const id = 'update-id';
      const roles = ['new-role'];
      const user = {
        ...defaultUser,
        roles: [{ id: 'old-role' }] as Role[],
      };
      const findOneSpy = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(user);
      const findAllSpy = jest
        .spyOn(roleRepository, 'findAll')
        .mockResolvedValueOnce([{ id: 'new-role' }] as Role[]);
      const disconectRolesSpy = jest
        .spyOn(repository, 'disconectRoles')
        .mockResolvedValueOnce(user);
      const connectRolesSpy = jest
        .spyOn(repository, 'connectRoles')
        .mockResolvedValueOnce({
          ...defaultUser,
          roles: [{ id: 'new-role' }] as Role[],
        });

      // Act
      const result = await service.updateRoles(id, roles);

      // Assert
      expect(result).toEqual(
        new UserResponseDto({
          ...defaultUser,
          roles: [{ id: 'new-role' }] as Role[],
        }),
      );
      expect(findOneSpy).toHaveBeenCalledWith({ id });
      expect(findAllSpy).toHaveBeenCalledWith({
        id: { in: roles },
      });
      expect(disconectRolesSpy).toHaveBeenCalledWith({ id }, [
        { id: 'old-role' },
      ]);
      expect(connectRolesSpy).toHaveBeenCalledWith({ id }, ['new-role']);
    });
  });
});
