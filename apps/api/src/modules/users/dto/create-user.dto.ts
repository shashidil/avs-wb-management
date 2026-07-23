import { USER_ROLES, type UserRole } from '@weighbridge/shared';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsIn(USER_ROLES)
  role!: UserRole;

  @IsString()
  @MinLength(8)
  password!: string;
}
