/*
  Warnings:

  - You are about to drop the column `size` on the `ProductVariant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId,color,sku]` on the table `ProductVariant` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ProductVariant_productId_color_size_sku_key";

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "size";

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_color_sku_key" ON "ProductVariant"("productId", "color", "sku");
