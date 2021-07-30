import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateContactInputDto {
  @Field(() => String)
  name!: string;

  @Field(() => String)
  email!: string;

  @Field(() => String)
  subject!: string;

  @Field(() => String)
  message!: string;
}
