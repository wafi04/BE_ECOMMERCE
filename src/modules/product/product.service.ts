import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductCreateDto } from './dto/product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private db: PrismaService) {}

  /**
   * Generate a unique SKU based on category and product details
   * @param categoryName Category name to use in SKU
   * @param productName Product name to use in SKU
   * @returns Generated SKU
   */

  private generateSKU(categoryName: string, productName: string): string {
    // Remove spaces and convert to uppercase
    const categorySanitized = categoryName
      .replace(/\s+/g, '')
      .toUpperCase()
      .substring(0, 3);
    const productSanitized = productName
      .replace(/\s+/g, '')
      .toUpperCase()
      .substring(0, 3);

    // Generate a random 4-digit number
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    // Combine elements to create SKU
    return `${categorySanitized}-${productSanitized}-${randomNum}`;
  }

  /**
   * Create a new product with transaction and SKU generation
   * @param data Product creation data
   * @returns Created product
   */

  async create(data: ProductCreateDto) {
    try {
      // Use transaction to ensure data consistency
      return await this.db.$transaction(async (prisma) => {
        // Verify category exists
        const category = await prisma.categories.findUnique({
          where: { id: data.categoryId },
        });

        if (!category) {
          throw new BadRequestException('Category Not Found');
        }

        // Generate SKU
        const sku = this.generateSKU(category.name, data.name);

        // Create product with generated SKU
        return await prisma.product.create({
          data: {
            name: data.name,
            description: data.description,
            price: data.price,
            categoryId: data.categoryId,
            sku,
          },
        });
      });
    } catch (error) {
      // Handle different types of errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle Prisma-specific errors
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'A product with this SKU already exists',
          );
        }
      }
      // Rethrow other errors
      throw error;
    }
  }

  async getAllProduct() {
    try {
      return await this.db.product.findMany({
        include: {
          category: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }
  async GetById(id: string) {
    try {
      const product = await this.db.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new BadRequestException('Product Not Found');
      }

      return product;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Log the error or handle other types of errors
      throw new InternalServerErrorException('Error retrieving product');
    }
  }

  async update(id: string, data: ProductCreateDto) {
    try {
      return await this.db.$transaction(async (prisma) => {
        // Verify category exists
        const category = await prisma.categories.findUnique({
          where: { id: data.categoryId },
        });

        if (!category) {
          throw new BadRequestException('Category Not Found');
        }

        const product = await prisma.product.findUnique({
          where: {
            id,
          },
        });
        // Generate SKU
        let sku: string;
        if (data.name !== product.name) {
          sku = this.generateSKU(category.name, data.name);
        } else {
          sku = product.sku;
        }

        // Create product with generated SKU
        return await prisma.product.update({
          where: {
            id,
          },
          data: {
            name: data.name,
            description: data.description,
            price: data.price,
            categoryId: data.categoryId,
            sku,
          },
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle Prisma-specific errors
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'A product with this SKU already exists',
          );
        }
      }
      // Rethrow other errors
      throw error;
    }
  }

  async deleteProduct(id: string) {
    try {
      // Hapus produk dalam transaksi
      const deletedProduct = await this.db.$transaction(async (prisma) => {
        // Periksa apakah produk ada
        const existingProduct = await prisma.product.findUnique({
          where: { id },
          include: {
            variants: {
              include: {
                image: true,
                inventory: true,
              },
            },
          },
        });

        if (!existingProduct) {
          throw new NotFoundException('Product not found');
        }

        // Hapus produk (akan secara otomatis menghapus:
        // 1. Semua variants dari produk ini
        // 2. Semua product images terkait variants
        // 3. Semua inventory terkait variants
        return await prisma.product.delete({
          where: { id },
        });
      });

      return deletedProduct;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Error deleting product:', error);
      throw new InternalServerErrorException('Failed to delete product');
    }
  }
}
