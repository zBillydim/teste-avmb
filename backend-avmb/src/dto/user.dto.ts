import { IsDefined, IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsDefined()
  name: string;

  @IsEmail()
  @IsDefined()
  email: string;

  @IsString()
  @MinLength(6)
  @IsDefined()
  password: string;
}
export class LoginUserDto {
  @IsEmail()
  @IsDefined()
  email: string;

  @IsString()
  @MinLength(6)
  @IsDefined()
  password: string;
}

