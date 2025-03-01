import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthPayloadUserDto,
  ProfileResponseDto,
} from '../../app/modules/auth/dto';
import { Permission, Role, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../config';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const requiredRoles = this.reflector.get(Roles, context.getHandler());
      const token = this.extractTokenFromHeader(request);
      const payload = await this.validatePayload(token);
      const user = await this.validateUserAuthenticated(payload);
      this.validateUserRoles(user, requiredRoles);
      request['user'] = new ProfileResponseDto(user);
    } catch {
      return false;
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string {
    const authorizationHeader = request.headers['authorization'] as
      | string
      | undefined;
    const [type, token] = authorizationHeader?.split(' ') ?? [];
    if (type !== 'Bearer') {
      throw new UnauthorizedException();
    }
    return token;
  }

  private async validatePayload(token: string): Promise<AuthPayloadUserDto> {
    return this.jwt.verifyAsync(token);
  }

  private async validateUserAuthenticated(
    payload: AuthPayloadUserDto,
  ): Promise<User & { roles: string[] }> {
    const user = await this.findUserAuthenticated(payload.sub, payload.email);
    return this.mapperUser(user);
  }

  private mapperUser(
    user: User & { roles: (Role & { permissions: Permission[] })[] },
  ): User & { roles: string[] } {
    return {
      ...user,
      roles: user.roles.reduce(
        (prev, current) => [
          ...prev,
          ...current.permissions.map((permission) => permission.name),
        ],
        [],
      ),
    };
  }

  private async findUserAuthenticated(
    id: string,
    email: string,
  ): Promise<User & { roles: (Role & { permissions: Permission[] })[] }> {
    return this.prisma.user.findUniqueOrThrow({
      where: {
        id,
        email,
        isActive: true,
      },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  private validateUserRoles(
    user: User & { roles: string[] },
    requiredRoles: string[],
  ): boolean {
    if (!requiredRoles?.length || user.isAdmin) {
      return true;
    }
    const hasPermission = user.roles.some((role) =>
      requiredRoles.includes(role),
    );
    if (!hasPermission) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
