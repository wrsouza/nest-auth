import { DocumentBuilder } from '@nestjs/swagger';

export const configSwagger = new DocumentBuilder()
  .setTitle('Nest Prisma Api')
  .setDescription('Nest Api with Prisma')
  .setVersion('1.0.0')
  .addTag('Auth')
  .addTag('Users')
  .addTag('Roles')
  .addTag('Permissions')
  .addBearerAuth()
  .build();
