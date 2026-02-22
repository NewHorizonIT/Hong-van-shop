/*
  Warnings:

  - You are about to alter the column `quantity` on the `order_items` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(12,3)`.

*/
-- AlterTable
ALTER TABLE "order_items" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(12,3);
