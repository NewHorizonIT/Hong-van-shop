import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";

export interface InventoryImportFilter {
  productVariantId?: string;
  from?: Date;
  to?: Date;
}

const importSelect = {
  id: true,
  quantity: true,
  importPrice: true,
  importDate: true,
  productVariant: {
    select: {
      id: true,
      name: true,
      unit: true,
      product: {
        select: { id: true, name: true },
      },
    },
  },
  createdBy: {
    select: { id: true, name: true },
  },
};

export const inventoryRepository = {
  async findAll(filter: InventoryImportFilter, page: number, limit: number) {
    const where: Prisma.InventoryImportWhereInput = {};

    if (filter.productVariantId) {
      where.productVariantId = filter.productVariantId;
    }

    if (filter.from || filter.to) {
      where.importDate = {};
      if (filter.from) where.importDate.gte = filter.from;
      if (filter.to) where.importDate.lte = filter.to;
    }

    const [imports, total] = await Promise.all([
      prisma.inventoryImport.findMany({
        where,
        select: importSelect,
        orderBy: { importDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inventoryImport.count({ where }),
    ]);

    return { imports, total };
  },

  async findById(id: string) {
    return prisma.inventoryImport.findUnique({
      where: { id },
      select: importSelect,
    });
  },

  async create(data: {
    productVariantId: string;
    quantity: number;
    importPrice: number;
    importDate: Date;
    createdById: string;
  }) {
    // Use transaction to update stock quantity
    return prisma.$transaction(async (tx) => {
      // Create import record
      const importRecord = await tx.inventoryImport.create({
        data: {
          productVariantId: data.productVariantId,
          quantity: data.quantity,
          importPrice: data.importPrice,
          importDate: data.importDate,
          createdById: data.createdById,
        },
        select: importSelect,
      });

      // Update stock quantity
      await tx.productVariant.update({
        where: { id: data.productVariantId },
        data: {
          stockQuantity: { increment: data.quantity },
        },
      });

      return importRecord;
    });
  },

  async update(
    id: string,
    oldQuantity: number,
    data: {
      quantity?: number;
      importPrice?: number;
      importDate?: Date;
    },
  ) {
    return prisma.$transaction(async (tx) => {
      const importRecord = await tx.inventoryImport.findUnique({
        where: { id },
        select: { productVariantId: true },
      });

      if (!importRecord) return null;

      // Update stock quantity if quantity changed
      if (data.quantity !== undefined && data.quantity !== oldQuantity) {
        const diff = data.quantity - oldQuantity;
        await tx.productVariant.update({
          where: { id: importRecord.productVariantId },
          data: {
            stockQuantity: { increment: diff },
          },
        });
      }

      return tx.inventoryImport.update({
        where: { id },
        data,
        select: importSelect,
      });
    });
  },

  async delete(id: string, quantity: number, productVariantId: string) {
    return prisma.$transaction(async (tx) => {
      // Delete import record
      await tx.inventoryImport.delete({
        where: { id },
      });

      // Decrease stock quantity
      await tx.productVariant.update({
        where: { id: productVariantId },
        data: {
          stockQuantity: { decrement: quantity },
        },
      });
    });
  },

  async getVariant(id: string) {
    return prisma.productVariant.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    });
  },
};
