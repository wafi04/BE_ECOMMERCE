import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ProductSeeder } from './modules/seeder/productSeeder';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useLogger(new Logger());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // try {
  //   const seeder = app.get(ProductSeeder);
  //   await seeder.runSeeder();
  //   console.log('Seeding completed successfully');
  // } catch (error) {
  //   console.error('Seeding failed', error);
  // }

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
    allowedHeaders: [
      'Accept',
      'Authorization',
      'Content-type',
      'X-Requested-With',
      'apollo-require-preflight',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  });
  await app.listen(3001);
}
bootstrap();
