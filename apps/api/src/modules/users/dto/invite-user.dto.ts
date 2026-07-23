import { USER_ROLES, type UserRole } from '@weighbridge/shared';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

export class InviteUserDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsIn(USER_ROLES)
  role!: UserRole;
}
