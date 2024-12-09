import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Module,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CategoryService } from './categories.service';
import { CategoryCreateDto } from './dto/categories.create.dto';

@Controller('api/category')
export class CategoryController {
  private readonly logger = new Logger();
  constructor(private readonly categoryService: CategoryService) {}
  @Post()
  async create(@Body() data: CategoryCreateDto) {
    this.logger.log(data);
    if (data.parentId === undefined) {
      console.warn('WARNING: parentId is undefined');
    }
    return this.categoryService.create(data);
  }

  @Get()
  async GetCategory() {
    return this.categoryService.getCategoryTree();
  }

  @Put('/:id')
  async update(@Param() id: { id: string }, @Body() data: CategoryCreateDto) {
    this.logger.log(data, id);
    return this.categoryService.update(id.id, data);
  }

  @Delete('/:id')
  async delete(@Param() id: { id: string }) {
    return this.categoryService.delete(id.id);
  }
}
