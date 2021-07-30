import { Module } from '@nestjs/common';

import { CoreModule } from '@datamin/core';
import { AuthenticationModule } from '@datamin/authentication';

@Module({
  imports: [CoreModule, AuthenticationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
