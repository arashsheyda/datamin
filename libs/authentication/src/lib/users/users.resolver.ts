import { Resolver, Query, Mutation, Args, Context, ResolveField, Parent } from '@nestjs/graphql';
import { User, UserDocument } from './user.entity';
import { CreateUserInput, UpdateUserInput } from './user.inputs.dto';
import { UsersService } from './users.service';
import { UserInputError, ValidationError } from 'apollo-server-core';
import { UseGuards } from '@nestjs/common';
import { AdminAllowedArgs } from '../auth/decorators/admin-allowed-args';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UsernameEmailAdminGuard } from '../auth/guards/username-email-admin.guard';

@Resolver(User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => [User])
  @UseGuards(JwtAuthGuard, AdminGuard)
  async users(): Promise<UserDocument[]> {
    return await this.usersService.findAll();
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard, UsernameEmailAdminGuard)
  async user(@Args('email') email: string) {
    let user: User | undefined;
    if (email) {
      user = await this.usersService.findOneByEmail(email);
    } else {
      // Is this the best exception for a graphQL error?
      throw new ValidationError('A username or email must be included');
    }

    if (user) return user;
    throw new UserInputError('The user does not exist');
  }

  // find One By username
  @Query(() => User)
  @UseGuards(JwtAuthGuard, UsernameEmailAdminGuard)
  async userByUserName(@Args('username') username: string) {
    let user: User | undefined;
    if (username) {
      user = await this.usersService.findOneByUsername(username);
    } else {
      throw new ValidationError('A username must be included');
    }

    if (user) return user;
    throw new UserInputError('The user does not exist');
  }

  @Mutation(() => User)
  async register(@Args('input') input: CreateUserInput): Promise<UserDocument> {
    let newUser: UserDocument | undefined;
    try {
      newUser = await this.usersService.create(input);
    } catch (error) {
      throw new UserInputError(error.message);
    }
    return newUser;
  }

  @Mutation(() => User)
  @AdminAllowedArgs('username', 'input.username', 'input.email', 'input.enabled')
  @UseGuards(JwtAuthGuard, UsernameEmailAdminGuard)
  async updateUser(
    @Args('email') email: string,
    @Args('input') input: UpdateUserInput,
    @Context('req') request,
  ): Promise<User> {
    let user: UserDocument | undefined;
    if (!email && request.user) email = request.user.email;
    try {
      user = await this.usersService.update(email, input);
    } catch (error) {
      throw new ValidationError(error.message);
    }
    if (!user) throw new UserInputError('The user does not exist');
    return user;
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, UsernameEmailAdminGuard)
  async follow(
    @Args('currentUserUsername') currentUserUsername: string,
    @Args('otherUserUsername') otherUserUsername: string,
    @Context('req') request,
  ): Promise<User> {
    let user: UserDocument | undefined;
    if (!currentUserUsername && request.user) currentUserUsername = request.user.username;
    try {
      user = await this.usersService.follow(currentUserUsername, otherUserUsername);
    } catch (error) {
      throw new ValidationError(error.message);
    }
    if (!user) throw new UserInputError('The user does not exist');
    return user;
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, UsernameEmailAdminGuard)
  async unfollow(
    @Args('currentUserUsername') currentUserUsername: string,
    @Args('otherUserUsername') otherUserUsername: string,
    @Context('req') request,
  ): Promise<User> {
    let user: UserDocument | undefined;
    if (!currentUserUsername && request.user) currentUserUsername = request.user.username;
    try {
      user = await this.usersService.unfollow(currentUserUsername, otherUserUsername);
    } catch (error) {
      throw new ValidationError(error.message);
    }
    if (!user) throw new UserInputError('The user does not exist');
    return user;
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, AdminGuard)
  async addAdminPermission(@Args('email') email: string, @Args('permission') permission: string): Promise<User> {
    const user = await this.usersService.addPermission(permission, email);
    if (!user) throw new UserInputError('The user does not exist');
    return user;
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, AdminGuard)
  async removeAdminPermission(@Args('email') email: string): Promise<User> {
    const user = await this.usersService.removePermission('admin', email);
    if (!user) throw new UserInputError('The user does not exist');
    return user;
  }

  @ResolveField()
  async followers(@Parent() user: UserDocument) {
    return await (
      await user.populate({ path: 'followers', model: User.name }).execPopulate()
    ).followers;
  }

  @ResolveField()
  async following(@Parent() user: UserDocument) {
    return await (
      await user.populate({ path: 'following', model: User.name }).execPopulate()
    ).following;
  }
}
