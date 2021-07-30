import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginResult, LoginUserInput } from './auth.inputs.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // : Promise<LoginResult | undefined>
  async validateUserByPassword(input: LoginUserInput) {
    let user: UserDocument | undefined;

    user = await this.usersService.findOneByEmail(input.email);
    // If the user is not enabled, disable log in - the token wouldn't work anyways
    if (user && user.enabled === false) user = undefined;
    if (!user) return undefined;

    // Check the supplied password against the hash stored for this email address
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(input.password, user.password);
    } catch (error) {
      return undefined;
    }

    if (isMatch) {
      // If there is a successful match, generate a JWT for the user
      const token = this.createJwt(user).token;
      const result: LoginResult = {
        user: user,
        token,
      };
      user.lastSeenAt = new Date();
      user.save();
      console.log(result);
      return result;
    }

    return undefined;
  }

  async validateJwtPayload(payload: JwtPayload): Promise<UserDocument | undefined> {
    // This will be used when the user has already logged in and has a JWT
    const user = await this.usersService.findOneByEmail(payload.email);

    // Ensure the user exists and their account isn't disabled
    if (user && user.enabled) {
      user.lastSeenAt = new Date();
      user.save();
      return user;
    }

    return undefined;
  }

  createJwt(user: User): { data: JwtPayload; token: string } {
    const expiresIn = 100;
    let expiration: Date | undefined;
    if (expiresIn) {
      expiration = new Date();
      expiration.setTime(expiration.getTime() + expiresIn * 1000);
    }
    const data: JwtPayload = {
      email: user.email,
      username: user.username,
      expiration,
    };

    const jwt = this.jwtService.sign(data);

    return {
      data,
      token: jwt,
    };
  }
}
