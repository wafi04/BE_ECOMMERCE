import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/clodinary.service';
import { CreateVariantDto } from './dto/variants.dto';

@Injectable()
export class VariantsService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly db: PrismaService,
  ) {}

  async create(data: CreateVariantDto, files: Express.Multer.File[]) {
    try {
      // Parallel operations
      const [product, uploadedImages] = await Promise.all([
        this.db.product.findUnique({
          where: { id: data.productId },
          include: { category: true },
        }),
        Promise.all(
          files.map((file) => this.cloudinaryService.UploadImage(file)),
        ),
      ]);

      if (!product) {
        throw new BadRequestException('Product Not Found');
      }

      const sku = this.generateSku(data, product.sku);

      // Use transaction for atomic database writes
      return this.db.$transaction(
        async (prisma) => {
          const variant = await prisma.productVariant.create({
            data: {
              productId: data.productId,
              color: data.color,
              sku: sku,
              image: {
                create: uploadedImages.map((file, index) => ({
                  url: file.secure_url,
                  isMain: index === 0, // First image as main
                })),
              },
              inventory: {
                create: data.inventory.map((item) => ({
                  size: item.size,
                  availableStock: item.availableStock,
                  stock: item.stock,
                })),
              },
            },
            include: {
              image: true,
              inventory: true,
            },
          });

          return variant;
        },
        {
          timeout: 15000, // Increased timeout
          maxWait: 20000, // Increased max wait time
        },
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to create variant');
    }
  }

  // Helper method to generate SKU
  private generateSku(data: CreateVariantDto, skuProduct: string): string {
    // Pisahkan komponen SKU produk
    const [category, productCode, specificCode] = skuProduct.split('-');

    // Sanitasi warna dan ukuran
    const colorSanitized = data.color
      .replace(/\s+/g, '')
      .toUpperCase()
      .substring(0, 3);

    // Gabungkan dengan struktur baru
    return `${category}-${productCode}-${colorSanitized}-${specificCode}`;
  }

  async getVariantsFromProduct(id: string) {
    try {
      const product = await this.db.product.findUnique({
        where: {
          id,
        },
      });

      if (!product) {
        throw new BadRequestException('Product Not Found');
      }

      return await this.db.productVariant.findMany({
        where: {
          productId: product.id,
        },
        include: {
          image: true,
          inventory: true,
          product: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to Get Variants Product');
    }
  }
}
