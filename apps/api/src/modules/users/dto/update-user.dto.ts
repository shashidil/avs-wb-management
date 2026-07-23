import { USER_ROLES, type UserRole } from '@weighbridge/shared';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsIn(USER_ROLES)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
