import { configSwagger } from '../../../../src/config';

describe('configSwagger', () => {
  it('should make config swagger', () => {
    // Arrange
    const securitySchemes = {
      bearer: {
        bearerFormat: 'JWT',
        scheme: 'bearer',
        type: 'http',
      },
    };
    const info = {
      contact: {},
      description: 'Nest Api with Prisma',
      title: 'Nest Prisma Api',
      version: '1.0.0',
    };
    const tags = [
      {
        name: 'Auth',
        description: '',
      },
      {
        name: 'Users',
        description: '',
      },
      {
        name: 'Roles',
        description: '',
      },
      {
        name: 'Permissions',
        description: '',
      },
    ];

    // Assert
    expect(configSwagger).toEqual(
      expect.objectContaining({
        components: {
          securitySchemes,
        },
        info,
        tags,
      }),
    );
  });
});
