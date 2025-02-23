import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from '../../../../src/common';
import * as bcrypt from 'bcrypt';

describe('BcryptService', () => {
  let service: BcryptService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptService],
    }).compile();

    service = module.get<BcryptService>(BcryptService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should service be defined', () => {
    // Assert
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('should encrypt password', () => {
      // Arrange
      const expectedHash = 'password-hash';
      const hashSyncSpy = jest
        .spyOn(bcrypt, 'hashSync')
        .mockReturnValue(expectedHash);
      const password = 'example';

      // Act
      const hash = service.hash(password);

      // Assert
      expect(hash).toEqual(expectedHash);
      expect(hashSyncSpy).toHaveBeenCalledWith(password, 10);
    });
  });

  describe('compare', () => {
    it.each([
      [
        'should compare password with hash and return true',
        {
          passwordVerify: 'valid-password',
          passwordHash: 'password-hash',
          expectedResult: true,
        },
      ],
      [
        'should compare password with hash and return false',
        {
          passwordVerify: 'invalid-password',
          passwordHash: 'password-hash',
          expectedResult: false,
        },
      ],
    ])('%s', (_, data) => {
      // Arrange
      const { passwordVerify, passwordHash, expectedResult } = data;
      const compareSyncSpy = jest
        .spyOn(bcrypt, 'compareSync')
        .mockReturnValueOnce(expectedResult);

      // Act
      const isValid = service.compare(passwordVerify, passwordHash);

      // Assert
      expect(isValid).toEqual(expectedResult);
      expect(compareSyncSpy).toHaveBeenCalledTimes(1);
      expect(compareSyncSpy).toHaveBeenCalledWith(passwordVerify, passwordHash);
    });
  });
});
