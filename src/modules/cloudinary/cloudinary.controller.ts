import {
  BadRequestException,
  Controller,
  InternalServerErrorException,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './clodinary.service';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly CloudinaryService: CloudinaryService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
      return await this.CloudinaryService.UploadImage(file);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
