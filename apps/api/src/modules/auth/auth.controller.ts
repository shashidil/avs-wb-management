import { Controller, Get } from '@nestjs/common';
import type { AppUser } from '@weighbridge/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  @Get('me')
  getMe(@CurrentUser() user: AppUser): AppUser {
    return user;
  }
}
