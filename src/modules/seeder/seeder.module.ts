import { Module } from '@nestjs/common';
import { ProductSeeder } from './productSeeder';

@Module({
  providers: [ProductSeeder],
  exports: [ProductSeeder],
})
export class SeederModule {}
