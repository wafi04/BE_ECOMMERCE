import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryService } from '../cloudinary/clodinary.service';
import { VariantsController } from './variants.controller';
import { VariantsService } from './variants.service';

@Module({
  controllers: [VariantsController],
  providers: [CloudinaryService, VariantsService],
})
export class VariantsModule {}
