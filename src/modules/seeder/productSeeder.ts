// src/modules/seeder/product.seeder.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductSeeder {
  constructor(private prismaService: PrismaService) {}

  private generateSKU(categoryName: string, productName: string): string {
    const categorySanitized = categoryName
      .replace(/\s+/g, '')
      .toUpperCase()
      .substring(0, 3);

    const productSanitized = productName
      .replace(/\s+/g, '')
      .toUpperCase()
      .substring(0, 3);

    const randomNum = Math.floor(1000 + Math.random() * 9000);

    return `${categorySanitized}-${productSanitized}-${randomNum}`;
  }

  async seedProductFromCsv(filepath: string, categoryId: string) {
    const results: any[] = [];

    // Use a promise to read the CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(filepath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    try {
      await this.prismaService.$transaction(async (prisma) => {
        // Verify category exists
        const category = await prisma.categories.findUnique({
          where: { id: categoryId },
        });

        if (!category) {
          throw new Error(`Category with ID ${categoryId} not found`);
        }

        for (const item of results) {
          // Clean and prepare data
          const name = item.Judul?.trim() || '';
          const price =
            parseFloat(item.Harga?.replace('Rp ', '').replace(/\./g, '')) || 0;

          // Skip if name is empty or price is 0
          if (!name || price === 0) continue;

          // Create product
          await prisma.product.create({
            data: {
              name: name,
              description: `${name} - Men's Shoe`,
              price: price,
              categoryId: categoryId,
              sku: this.generateSKU(category.name, name),
            },
          });
        }

        console.log(`Seeded ${results.length} products successfully`);
      });
    } catch (error) {
      console.error('Error seeding products:', error);
      throw error;
    }
  }

  // New method to run the seeder
  async runSeeder() {
    try {
      // Ensure the category exists first
      // const category = await this.prismaService.categories.findUnique({
      //   where: { id: 'cm4ftul1p0001rmdgeqozc607' },
      // });

      // Construct the full path to the CSV file
      const csvPath = path.resolve(__dirname, '../../../mens_shoes.csv');
      // Run the seeder with the category ID
      await this.ProductImagesFromCsv(csvPath);
    } catch (error) {
      console.error('Seeder failed:', error);
    }
  }

  private generateSkus(color: string, skuProduct: string): string {
    try {
      // Tambahkan pengecekan input
      if (!color) {
        throw new Error('Color is undefined');
      }

      if (!skuProduct) {
        throw new Error('SKU Product is undefined');
      }

      // Cek apakah skuProduct memiliki format yang diharapkan
      const skuParts = skuProduct.split('-');
      if (skuParts.length < 3) {
        console.warn(
          `Unexpected SKU format: ${skuProduct}. Using alternative method.`,
        );
        // Fallback method jika format tidak sesuai
        return this.generateFallbackSku(color, skuProduct);
      }

      // Pisahkan komponen SKU produk
      const [category, productCode, specificCode] = skuParts;

      // Sanitasi warna dan ukuran
      const colorSanitized = color
        .replace(/\s+/g, '')
        .toUpperCase()
        .substring(0, 3);

      // Gabungkan dengan struktur baru
      return `${category}-${productCode}-${colorSanitized}-${specificCode}`;
    } catch (error) {
      console.error('Error in generateSkus:', error);
      throw error;
    }
  }

  // Metode fallback untuk generate SKU
  private generateFallbackSku(color: string, productId: string): string {
    const colorSanitized = color
      .replace(/\s+/g, '')
      .toUpperCase()
      .substring(0, 3);

    return `GEN-${productId}-${colorSanitized}-${Date.now()}`;
  }

  async VariantsFromCsv(filepath: string) {
    const results: any[] = [];

    // Use a promise to read the CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(filepath)
        .pipe(csv())
        .on('data', (data) => {
          // Tambahkan log untuk memastikan data masuk dengan benar
          console.log('Raw CSV Data:', data);
          results.push(data);
        })
        .on('end', () => {
          console.log('Total results:', results.length);
          resolve(results);
        })
        .on('error', (error) => {
          console.error('CSV Reading Error:', error);
          reject(error);
        });
    });

    try {
      // Loop through each result in the CSV
      for (const item of results) {
        // Log setiap item untuk debugging
        console.log('Processing item:', item);

        const product = await this.prismaService.product.findUnique({
          where: {
            id: item.ProductId,
          },
        });

        // Validasi data sebelum proses
        if (!item.Color || !item.ProductId) {
          console.warn('Skipping invalid item:', item);
          continue;
        }

        try {
          // Generate SKU dengan penanganan error
          const sku = this.generateSkus(item.Color, product.sku);

          await this.prismaService.productVariant.create({
            data: {
              color: item.Color,
              sku,
              productId: item.ProductId, // Pastikan ini valid
            },
          });
        } catch (itemError) {
          console.error('Error processing individual item:', itemError);
          // Lanjutkan proses untuk item berikutnya
          continue;
        }
      }

      console.log(`Successfully seeded ${results.length} product variants`);
    } catch (error) {
      console.error('Error seeding product variants:', error);
      throw error;
    }
  }

  async ProductImagesFromCsv(filepath: string) {
    const results: any[] = [];

    // Use a promise to read the CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(filepath)
        .pipe(csv())
        .on('data', (data) => {
          // Tambahkan log untuk memastikan data masuk dengan benar
          console.log('Raw CSV Data:', data);
          results.push(data);
        })
        .on('end', () => {
          console.log('Total results:', results.length);
          resolve(results);
        })
        .on('error', (error) => {
          console.error('CSV Reading Error:', error);
          reject(error);
        });
    });

    try {
      for (const item of results) {
        console.log('Processing item:', item);

        const variants = await this.prismaService.productVariant.findUnique({
          where: {
            id: item.variantId,
          },
        });

        if (!variants) {
          throw new Error('variants not found');
        }
        await this.prismaService.productImage.create({
          data: {
            url: item.images,
            isMain: true,
            variantId: item.variantId,
          },
        });
      }
      console.log(`Successfully seeded ${results.length} product images`);
    } catch (error) {
      console.error('Error seeding product variants:', error);
      throw error;
    }
  }
}
