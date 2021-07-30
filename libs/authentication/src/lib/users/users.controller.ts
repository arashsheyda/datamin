import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsernameEmailAdminGuard } from '../auth/guards/username-email-admin.guard';
import { User, UserDocument } from './user.entity';
import { CreateUserInput } from './user.inputs.dto';
import { UsersService } from './users.service';

@Controller('auth/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  async users(): Promise<UserDocument[]> {
    return await this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, UsernameEmailAdminGuard)
  @Get('show')
  async user(@Body() email: string) {
    let user: User | undefined;
    if (email) {
      user = await this.usersService.findOneByEmail(email);
    } else {
      // Is this the best exception for a graphQL error?
      throw new Error('A username or email must be included');
    }

    if (user) return user;
    throw new Error('The user does not exist');
  }

  @Post('register')
  async register(@Body() input: CreateUserInput): Promise<UserDocument> {
    let newUser: UserDocument | undefined;
    try {
      newUser = await this.usersService.create(input);
    } catch (error) {
      throw new Error(error.message);
    }
    return newUser;
  }
}
