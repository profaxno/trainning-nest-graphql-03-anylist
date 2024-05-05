import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      //forbidNonWhitelisted: true, //! tips: Esta validacion no permite que se envia mas informacion de la requerida en un request
    })
  );

  await app.listen(3000);
}
bootstrap();
