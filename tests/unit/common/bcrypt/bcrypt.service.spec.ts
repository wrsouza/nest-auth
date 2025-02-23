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

  describe('compare', () => {});
});
