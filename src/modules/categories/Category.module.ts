import { Module } from '@nestjs/common';
import { CategoryController } from './categories.controller';
import { CategoryService } from './categories.service';

@Module({
  providers: [CategoryService],
  controllers: [CategoryController],
})
export default class CategoryModule {}
