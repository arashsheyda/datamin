import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './user.entity';
import { CreateUserInput, UpdateUserInput } from './user.inputs.dto';
import { MongoError } from 'mongodb';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  isAdmin(permissions: string[]): boolean {
    return permissions.includes('admin');
  }

  async addPermission(permission: string, email: string): Promise<UserDocument | undefined> {
    const user = await this.findOneByEmail(email);
    if (!user) return undefined;
    if (user.permissions.includes(permission)) return user;
    user.permissions.push(permission);
    await user.save();
    return user;
  }

  async removePermission(permission: string, email: string): Promise<UserDocument | undefined> {
    const user = await this.findOneByEmail(email);
    if (!user) return undefined;
    user.permissions = user.permissions.filter((userPermission) => userPermission !== permission);
    await user.save();
    return user;
  }

  // Create New User
  async create(input: CreateUserInput): Promise<UserDocument> {
    const createdUser = new this.userModel(input);

    let newUser: UserDocument | undefined;
    try {
      newUser = await createdUser.save();
    } catch (error) {
      throw this.evaluateMongoError(error, input);
    }
    return newUser;
  }

  // Update User
  async update(email: string, input: UpdateUserInput): Promise<UserDocument | undefined> {
    if (input.username) {
      const duplicateUser = await this.findOneByUsername(input.username);
      if (duplicateUser) input.username = undefined;
    }

    if (input.email) {
      const duplicateUser = await this.findOneByEmail(input.email);
      // const emailValid = UserSchema.validateEmail(input.email);
      if (duplicateUser) input.email = undefined;
    }

    const fields: any = {};

    if (input.password) {
      if (await this.authService.validateUserByPassword({ email, password: input.password.oldPassword })) {
        // fields.password = input.password.newPassword;
        fields.password = await bcrypt.hash(input.password.newPassword, 10);
      }
    }

    // Remove undefined keys for update
    for (const key in input) {
      if (typeof input[key] !== 'undefined' && key !== 'password') {
        fields[key] = input[key];
      }
    }

    let user: UserDocument | undefined | null = null;

    if (Object.entries(input).length > 0) {
      user = await this.userModel.findOneAndUpdate({ email }, fields, { new: true, runValidators: true });
    } else {
      user = await this.findOneByEmail(email);
    }

    if (!user) return undefined;

    return user;
  }

  // Follow User
  async follow(currentUserUsername, otherUserUsername) {
    const user = await this.userModel.findOne({ username: currentUserUsername });
    const otherUser = await this.findOneByUsername(otherUserUsername);
    if (otherUser) {
      if (!user.following.includes(otherUser._id)) {
        user.following.push(otherUser._id);
        const followduser = await user.save();
        if (followduser) {
          if (!otherUser.followers.includes(user._id)) {
            otherUser.followers.push(user._id);
            await otherUser.save();
          }
        }
      }
    }
    return user;
  }

  // Unfollow User
  async unfollow(currentUserUsername, otherUserUsername) {
    const user = await this.userModel.findOne({ username: currentUserUsername });
    const otherUser = await this.findOneByUsername(otherUserUsername);
    if (otherUser) {
      if (user.following.includes(otherUser._id)) {
        user.following = this.arrayRemove(user.following, `${otherUser._id}`);
        const unFollowedUser = await user.save();
        if (unFollowedUser) {
          if (otherUser.followers.includes(user._id)) {
            otherUser.followers = this.arrayRemove(user.followers, `${user._id}`);
            await otherUser.save();
          }
        }
      }
    }
    return user;
  }

  // Find All Users
  async findAll(): Promise<UserDocument[]> {
    return await this.userModel.find().exec();
  }

  async findAllTeam() {
    return await this.userModel
      .where({ permissions: { $regex: 'team' } })
      .find({})
      .exec();
  }

  // Find One User by ID
  async findOneById(_id: Types.ObjectId | User) {
    const user = await this.userModel.findOne({ _id }).exec();
    if (user) return user;
    return undefined;
  }

  // Find One User by Email
  async findOneByEmail(email: string): Promise<UserDocument | undefined> {
    const user = await this.userModel.findOne({ email }).exec();
    if (user) return user;
    return undefined;
  }

  // Find One User by UserName
  async findOneByUsername(username: string): Promise<UserDocument | undefined> {
    const user = await this.userModel.findOne({ username }).exec();
    if (user) return user;
    return undefined;
  }

  // Delete All Users
  async deleteAllUsers(): Promise<void> {
    await this.userModel.deleteMany({});
  }

  // Custom Methods
  private evaluateMongoError(error: MongoError, input: CreateUserInput): Error {
    if (error.code === 11000) {
      if (error.message.toLowerCase().includes(input.email.toLowerCase())) {
        throw new Error(`e-mail ${input.email} is already registered`);
      } else if (error.message.toLowerCase().includes(input.username.toLowerCase())) {
        throw new Error(`Username ${input.username} is already registered`);
      }
    }
    throw new Error(error.message);
  }

  private arrayRemove(array, value) {
    return array.filter((element) => {
      return element != value;
    });
  }
}
