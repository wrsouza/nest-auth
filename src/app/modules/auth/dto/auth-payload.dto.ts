export class AuthPayloadUserDto {
  sub: string;
  email: string;
}

export class AuthPayloadDto {
  user: AuthPayloadUserDto;
}
