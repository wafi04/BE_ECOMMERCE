import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface InventoryForm {
  size: string;
  stock: number;
  availableStock: number;
  id?: string;
  variantId: string;
}

export class InventoryService {
  constructor(private db: PrismaService) {}

  async createOrUpdate(data: InventoryForm[], variantId: string) {
    // Periksa keberadaan varian dalam satu kueri
    const variant = await this.db.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new BadRequestException('Variant Not Found');
    }

    // Gunakan createMany untuk membuat beberapa entri sekaligus
    // dan transaksi untuk operasi yang aman
    const inventory = await this.db.$transaction(async (prisma) => {
      // Pisahkan data yang akan diperbarui dan dibuat
      const updateOperations = data.filter((item) => item.id);
      const createOperations = data.filter((item) => !item.id);

      // Jalankan operasi pembaruan dalam batch
      const updates = await Promise.all(
        updateOperations.map((item) =>
          prisma.inventory.update({
            where: { id: item.id },
            data: {
              size: item.size,
              stock: item.stock,
              availableStock: item.availableStock,
            },
          }),
        ),
      );

      // Gunakan createMany untuk operasi create dalam batch
      const creates = await prisma.inventory.createMany({
        data: createOperations.map((item) => ({
          size: item.size,
          stock: item.stock,
          variantId: variantId,
          availableStock: item.availableStock,
        })),
        skipDuplicates: true, // Opsional: lewati entri duplikat
      });

      return { updates, creates };
    });

    return inventory;
  }

  async delete(id: string) {
    return await this.db.inventory.delete({
      where: {
        id,
      },
    });
  }
}
