import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import type { AppUser } from '@weighbridge/shared';
import { Roles } from '../../common/decorators/roles.decorator';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@Roles('admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<AppUser[]> {
    return this.usersService.findAll();
  }

  @Post('invite')
  invite(@Body() dto: InviteUserDto): Promise<AppUser> {
    return this.usersService.invite(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<AppUser> {
    return this.usersService.update(id, dto);
  }
}
