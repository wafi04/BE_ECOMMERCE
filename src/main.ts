import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useLogger(new Logger());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Ini akan menghapus properti yang tidak ada di DTO
      forbidNonWhitelisted: true, // Menolak properti yang tidak ada di DTO
      transform: true, // Mengubah tipe data sesuai definisi DTO
    }),
  );
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
