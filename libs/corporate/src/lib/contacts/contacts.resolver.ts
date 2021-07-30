import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Contact } from './contact.entity';
import { CreateContactInputDto } from './contact.inputs.dto';
import { ContactsService } from './contacts.service';

@Resolver(() => Contact)
export class ContactsResolver {
  constructor(private contactService: ContactsService) {}

  @Query(() => [Contact])
  async contacts() {
    return await this.contactService.findAll();
  }

  @Mutation(() => Contact)
  async createContact(@Args('input') input: CreateContactInputDto): Promise<Contact | string> {
    return await this.contactService.create(input);
  }
}
