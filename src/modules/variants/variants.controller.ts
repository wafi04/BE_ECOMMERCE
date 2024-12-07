import { Body, Controller, Post } from '@nestjs/common';
import { CreateVariantDto } from './dto/variants.dto';
import { VariantsService } from './variants.service';

@Controller('api/variants')
export class VariantsController {
  constructor(private variantsService: VariantsService) {}

  @Post()
  async create(@Body() dto: CreateVariantDto) {
    return this.variantsService.create(dto);
  }
}
