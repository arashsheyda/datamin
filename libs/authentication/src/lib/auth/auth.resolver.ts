import { Resolver, Args, Query, Context, ObjectType, Field } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthenticationError } from 'apollo-server-core';
import { UseGuards } from '@nestjs/common';
import { LoginResult, LoginUserInput } from './auth.inputs.dto';
import { User, UserDocument } from '../users/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ObjectType()
export class Token {
  @Field(() => User)
  user: User;

  @Field(() => String)
  token: string;
}

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Query(() => Token)
  async login(@Args('input') input: LoginUserInput): Promise<LoginResult> {
    const result = await this.authService.validateUserByPassword(input);
    if (result) return result;
    throw new AuthenticationError('Could not log-in with the provided credentials');
  }

  // There is no username guard here because if the person has the token, they can be any user
  @Query(() => String)
  @UseGuards(JwtAuthGuard)
  async refreshToken(@Context('req') request): Promise<string> {
    const user: UserDocument = request.user;
    if (!user) throw new AuthenticationError('Could not log-in with the provided credentials');
    const result = await this.authService.createJwt(user);
    if (result) return result.token;
    throw new AuthenticationError('Could not log-in with the provided credentials');
  }
}
