import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Contact, ContactDocument } from './contact.entity';
import { CreateContactInputDto } from './contact.inputs.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact.name)
    private readonly conatctService: Model<ContactDocument>,
  ) {}

  async create(input: CreateContactInputDto): Promise<Contact | string> {
    try {
      const createdContact = await new this.conatctService(input).save();
      return createdContact;
    } catch (error) {
      throw new Error(`Something went wrong!`);
    }
  }

  async findAll(): Promise<Contact[] | string> {
    return await this.conatctService.find({}).exec();
  }

  async findById(_id: Types.ObjectId): Promise<Contact | string> {
    return await this.conatctService.findOne({ _id: _id });
  }

  async deleteById(_id: Types.ObjectId) {
    return await this.conatctService.deleteOne({ _id: _id });
  }

  async deleteAll() {
    return await this.conatctService.deleteMany({}).exec();
  }
}
