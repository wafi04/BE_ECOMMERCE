// seeder.script.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductSeeder } from './modules/seeder/productSeeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const seeder = app.get(ProductSeeder);
    await seeder.runSeeder();
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Seeding failed', error);
  } finally {
    await app.close();
  }
}

bootstrap();
