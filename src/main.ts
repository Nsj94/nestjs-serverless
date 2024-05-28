import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@codegenie/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

let server: Handler;
const configService = new ConfigService();
const nodeEnv = configService.get<string>('NODE_ENV');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (nodeEnv === 'production') {
    await app.init();

    const expressApp = app.getHttpAdapter().getInstance();
    return serverlessExpress({ app: expressApp });
  } else {
    await app.listen(3000);
  }
}

nodeEnv !== 'production' && bootstrap();
export const handler = async (
  event: any,
  context: Context,
  callback: Callback,
): Promise<any> => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
