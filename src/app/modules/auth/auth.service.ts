import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from '../../repositories';
import { BcryptService } from '../../../common/bcrypt/bcrypt.service';
import { AuthSignInDto, AuthResponseDto, AuthPayloadUserDto } from './dto';
import { ResponseErrorEnum } from '../../../common/enums/response-error.enum';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly repository: UserRepository,
    private readonly bcrypt: BcryptService,
    private readonly jwt: JwtService,
  ) {}

  async signIn(body: AuthSignInDto): Promise<AuthResponseDto> {
    const user = await this.getUserByEmail(body.email);
    this.checkPasswordIsValid(body.password, user.password);
    const payload: AuthPayloadUserDto = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload);
    return new AuthResponseDto(user, accessToken);
  }

  private async getUserByEmail(email: string): Promise<User> {
    const user = await this.repository.findOne({
      email,
      isActive: true,
    });
    if (!user) {
      throw new BadRequestException(ResponseErrorEnum.AUTH_INVALID);
    }
    return user;
  }

  private checkPasswordIsValid(password: string, hashPassword: string) {
    const isValid = this.bcrypt.compare(password, hashPassword);
    if (!isValid) {
      throw new BadRequestException(ResponseErrorEnum.AUTH_INVALID);
    }
  }
}
