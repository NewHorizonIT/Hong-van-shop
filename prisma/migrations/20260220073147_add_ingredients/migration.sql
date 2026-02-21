/*
  Warnings:

  - You are about to drop the column `product_variant_id` on the `inventory_imports` table. All the data in the column will be lost.
  - You are about to drop the column `cost_price` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `stock_quantity` on the `product_variants` table. All the data in the column will be lost.
  - Added the required column `ingredient_id` to the `inventory_imports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_price` to the `inventory_imports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "inventory_imports" DROP CONSTRAINT "inventory_imports_product_variant_id_fkey";

-- DropIndex
DROP INDEX "inventory_imports_product_variant_id_idx";

-- AlterTable
ALTER TABLE "inventory_imports" DROP COLUMN "product_variant_id",
ADD COLUMN     "ingredient_id" TEXT NOT NULL,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "total_price" DECIMAL(14,2) NOT NULL,
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "customer_id" TEXT,
ADD COLUMN     "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "cost_price",
DROP COLUMN "stock_quantity",
ADD COLUMN     "unit" TEXT NOT NULL DEFAULT 'phần';

-- CreateTable
CREATE TABLE "ingredients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "stock_quantity" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");

-- CreateIndex
CREATE INDEX "inventory_imports_ingredient_id_idx" ON "inventory_imports"("ingredient_id");

-- CreateIndex
CREATE INDEX "orders_customer_id_idx" ON "orders"("customer_id");

-- AddForeignKey
ALTER TABLE "inventory_imports" ADD CONSTRAINT "inventory_imports_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
