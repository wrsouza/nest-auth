import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import {
  AuthModule,
  UsersModule,
  RolesModule,
  PermissionsModule,
} from './app/modules';
import { GlobalJwtModule } from './common';
import { DatabaseModule } from './config';
import { OrdersModule } from './app/modules/orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object(
        process.env.NODE_ENV !== 'test'
          ? {
              DATABASE_URL: Joi.string().required(),
              JWT_SECRET: Joi.string().required(),
            }
          : {},
      ),
    }),
    DatabaseModule,
    GlobalJwtModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    OrdersModule,
  ],
})
export class AppModule {}
