import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { ConfigService } from '@nestjs/config';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  
  const environment = config.get('environment');
  const prefix = config.get('prefix');
  const host = config.get('host');
  const port = config.get('port');

  app.setGlobalPrefix(prefix);
  await app.listen(port, () => {
    Logger.log(`Listening at http://${host}:${port}/${prefix}`, 'RestAPI');
    Logger.log(`Listening at http://${host}:${port}/graphql`, 'GraphQL');
    Logger.log(`Running in ${environment} mode`);
  });
}

bootstrap();
