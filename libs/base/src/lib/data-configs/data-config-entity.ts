import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
@Schema({ timestamps: true })
export class DataConfig {
  @Field(() => String)
  _id!: Types.ObjectId;

  @Field(() => String)
  @Prop({ required: true })
  name!: string;

  @Field(() => String)
  @Prop({ required: true })
  key!: string;

  @Field(() => String)
  @Prop({ required: true })
  value!: string;

  @Field(() => String)
  @Prop({ required: true })
  type!: string;
}

export type DataConfigDocument = DataConfig & Document;

export const DataConfigSchema = SchemaFactory.createForClass(DataConfig);
