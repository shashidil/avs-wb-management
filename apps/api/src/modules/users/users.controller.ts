import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import type { AppUser } from '@weighbridge/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { SetPasswordDto } from './dto/set-password.dto';
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

  @Post()
  create(@Body() dto: CreateUserDto): Promise<AppUser> {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<AppUser> {
    return this.usersService.update(id, dto);
  }

  @Post(':id/set-password')
  @HttpCode(200)
  setPassword(@Param('id') id: string, @Body() dto: SetPasswordDto): Promise<void> {
    return this.usersService.setPassword(id, dto.password);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @CurrentUser() currentUser: AppUser): Promise<void> {
    if (id === currentUser.id) {
      throw new ForbiddenException('You cannot delete your own account');
    }
    return this.usersService.remove(id);
  }
}
