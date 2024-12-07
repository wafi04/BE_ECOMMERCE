import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/clodinary.service';
import { CreateVariantDto } from './dto/variants.dto';

@Injectable()
export class VariantsService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly db: PrismaService,
  ) {}

  async create(data: CreateVariantDto) {
    // Transaction ensures atomic operation
    return this.db.$transaction(async (prisma) => {
      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
        include: {
          category: true,
        },
      });

      if (!product) {
        throw new BadRequestException('Product Not Found');
      }

      // Upload images
      const uploadedImages = await Promise.all(
        data.images.map((file) => this.cloudinaryService.UploadImage(file)),
      );

      // Generate SKU (if not provided)
      const sku = this.generateSku(data, product.sku);

      // Create variant with images and inventory
      const variant = await prisma.productVariant.create({
        data: {
          productId: data.productId,
          color: data.color,
          size: data.size,
          sku: sku, // Use generated SKU
          image: {
            create: uploadedImages.map((file) => ({
              url: file.secure_url,
              isMain: false, // Consider logic for main image
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
        // Optionally include select or include to return full details
        include: {
          image: true,
          inventory: true,
        },
      });

      return variant;
    });
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

    const sizeSanitized = data.size
      .replace(/\s+/g, '')
      .toUpperCase()
      .substring(0, 2);

    // Gabungkan dengan struktur baru
    return `${category}-${productCode}-${colorSanitized}-${sizeSanitized}-${specificCode}`;
  }
}
