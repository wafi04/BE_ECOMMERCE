import { IsString, IsEmail, Matches } from 'class-validator';
import { PasswordValidator, PasswordValidator2 } from 'src/common/decorator/password.decorator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  @PasswordValidator2()
  email: string;

  @IsString()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character',
  })
  password: string;
}