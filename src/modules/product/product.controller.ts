import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProductCreateDto } from './dto/product.dto';
import { ProductService } from './product.service';

@Controller('api/product')
export class ProductController {
  private logger = new Logger();
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() create: { create: ProductCreateDto }) {
    this.logger.log(create);
    return await this.productService.create(create.create);
  }

  @Get()
  async GetAll() {
    return await this.productService.getAllProduct();
  }

  @Get('/:id')
  async GetProductById(@Param() id: { id: string }) {
    return await this.productService.GetById(id.id);
  }

  @Put('/:id')
  async update(@Param() id: { id: string }, @Body() data: ProductCreateDto) {
    this.logger.log(data);
    return await this.productService.update(id.id, data);
  }

  @Delete('/:id')
  async Delete(@Param() id: { id: string }) {
    return await this.productService.deleteProduct(id.id);
  }
}
