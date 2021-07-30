import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
@Schema({ timestamps: true })
export class Contact {
  @Field(() => String)
  _id: Types.ObjectId;

  @Field(() => String)
  @Prop({ required: true })
  name!: string;

  @Field(() => String)
  @Prop({ required: true })
  email!: string;

  @Field(() => String)
  @Prop({ required: true })
  subject!: string;

  @Field(() => String)
  @Prop()
  message!: string;
}

export type ContactDocument = Contact & Document;

export const ContactSchema = SchemaFactory.createForClass(Contact);
