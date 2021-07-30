import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

import * as bcrypt from 'bcrypt';

@ObjectType()
@Schema({ timestamps: true })
export class User {
  @Field(() => String)
  _id: Types.ObjectId;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  firstname: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  lastname: string;

  @Field(() => String)
  @Prop({ unique: true })
  username: string;

  @Field(() => String)
  @Prop({ unique: true, validate: { validator: validateEmail } })
  email: string;

  @Field(() => String)
  @Prop({ required: true })
  password: string;

  @Field(() => [User])
  @Prop({ type: [{ type: Types.ObjectId, ref: User.name }] })
  followers?: Types.ObjectId[] | User[];

  @Field(() => [User])
  @Prop({ type: [{ type: Types.ObjectId, ref: User.name }] })
  following?: Types.ObjectId[] | User[];

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  position: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  job: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  avatar: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  background: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  phone: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  address: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  website: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  instagram: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  facebook: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  twitter: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  linkedin: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  telegram: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  dribbble: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  behance: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  bio: string;

  @Field(() => [String])
  @Prop()
  permissions: string[];

  // @Field(() => [String])
  // @Prop()
  // config: DataConfig;

  @Field(() => Date)
  @Prop()
  createdAt: Date;

  @Field(() => Date)
  @Prop()
  updatedAt: Date;

  @Field(() => Date)
  @Prop({ default: Date.now })
  lastSeenAt: Date;

  @Field(() => Boolean)
  @Prop({ default: true })
  enabled: boolean;
}

function validateEmail(email: string) {
  // tslint:disable-next-line:max-line-length
  const expression =
    // eslint-disable-next-line no-useless-escape
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return expression.test(email);
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.statics.validateEmail = function (email: string): boolean {
  return validateEmail(email);
};

// NOTE: Arrow functions are not used here as we do not want to use lexical scope for 'this'
UserSchema.pre<UserDocument>('save', function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  // Make sure not to rehash the password if it is already hashed
  if (!user.isModified('password')) {
    return next();
  }

  // Generate a salt and use it to hash the user's password
  bcrypt.genSalt(10, (genSaltError, salt) => {
    if (genSaltError) {
      return next(genSaltError);
    }

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

// UserSchema.methods.checkPassword = function(
//   password: string,
// ): Promise<boolean> {
//   const user = this;

//   return new Promise((resolve, reject) => {
//     bcrypt.compare(password, user.password, (error, isMatch) => {
//       if (error) {
//         reject(error);
//       }

//       resolve(isMatch);
//     });
//   });
// };

// UserSchema.methods.arashi = function () {
//   // eslint-disable-next-line @typescript-eslint/no-this-alias
//   const user = this;
//   console.log(user);
// };
