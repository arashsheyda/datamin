import { Body, Controller, Post } from '@nestjs/common';
import { LoginResult, LoginUserInput } from './auth.inputs.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() input: LoginUserInput): Promise<LoginResult> {
    const result = await this.authService.validateUserByPassword(input);
    if (result) return result;
    throw new Error('Could not log-in with the provided credentials');
  }
}
