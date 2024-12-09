import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import * as toStream from 'buffer-to-stream';

@Injectable()
export class CloudinaryService {
  async UploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    try {
      if (!file || !file.buffer) {
        throw new BadRequestException('Invalid file or missing buffer');
      }
      console.log('File details:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        bufferLength: file.buffer ? file.buffer.length : 'No buffer',
      });
      return new Promise((resolve, reject) => {
        const uploadStream = v2.uploader.upload_stream(
          {
            folder: 'product_variants',
            // Tambahan opsional:
            resource_type: 'auto', // Detect file type otomatis
            // transformation opsional
            // transformation: [
            //   { width: 500, height: 500, crop: 'limit' }
            // ]
          },
          (error, result) => {
            if (error)
              return reject(new InternalServerErrorException('Upload failed'));
            resolve(result);
          },
        );

        const stream = toStream(file.buffer);
        stream.pipe(uploadStream);
      });
    } catch (error) {
      // Global error handling
      throw new InternalServerErrorException('Image upload error');
    }
  }
}
