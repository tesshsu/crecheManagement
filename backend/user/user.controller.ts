import { Controller, Get, Put, Query, Body, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUser(@Query('username') username: string): Promise<User> {
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }

  @Put()
  async createOrUpdateUser(
    @Body('email') email: string,
    @Body('username') username: string,
  ): Promise<User> {
    return this.userService.createOrUpdate(email, username);
  }
}
