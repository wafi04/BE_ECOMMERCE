import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { VariantsService } from './variants.service';

@Controller('api/variants')
export class VariantsController {
  private logger = new Logger();
  constructor(private variantsService: VariantsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images')) // Gunakan FilesInterceptor untuk multiple files
  async create(
    @Body() body: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    try {
      // Parse the JSON payload
      const payload = JSON.parse(body.payload);
      const images = files || [];
      this.logger.log(images);

      // Process payload and files
      return this.variantsService.create(payload, images);
    } catch (error) {
      console.error('Error in create method:', error);
      throw new BadRequestException('Failed to process request');
    }
  }

  @Get('/product/:id')
  async getAll(@Param() id: { id: string }) {
    return await this.variantsService.getVariantsFromProduct(id.id);
  }
}
