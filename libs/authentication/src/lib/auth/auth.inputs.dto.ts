import { InputType, Field } from '@nestjs/graphql';
import { User } from '../users/user.entity';

@InputType()
export class LoginUserInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;
}

@InputType()
export class LoginResult {
  @Field(() => User)
  user: User;

  @Field(() => String)
  token: string;
}
