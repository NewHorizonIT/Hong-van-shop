import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";

export interface InventoryImportFilter {
  ingredientId?: string;
  from?: Date;
  to?: Date;
}

const importSelect = {
  id: true,
  quantity: true,
  importPrice: true,
  totalPrice: true,
  importDate: true,
  note: true,
  ingredient: {
    select: {
      id: true,
      name: true,
      unit: true,
    },
  },
  createdBy: {
    select: { id: true, name: true },
  },
};

export const inventoryRepository = {
  async findAll(filter: InventoryImportFilter, page: number, limit: number) {
    const where: Prisma.InventoryImportWhereInput = {};

    if (filter.ingredientId) {
      where.ingredientId = filter.ingredientId;
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

    // Filter out imports with null ingredients
    const filteredImports = imports.filter(
      (imp) => imp.ingredient !== null,
    ) as any[];

    return { imports: filteredImports, total } as any;
  },

  async findById(id: string) {
    return prisma.inventoryImport.findUnique({
      where: { id },
      select: importSelect,
    });
  },

  async create(data: {
    ingredientId: string;
    quantity: number;
    importPrice: number;
    importDate: Date;
    note?: string;
    createdById: string;
  }) {
    const totalPrice = data.quantity * data.importPrice;

    // Use transaction to update stock quantity
    return prisma.$transaction(async (tx) => {
      // Create import record
      const importRecord = await tx.inventoryImport.create({
        data: {
          ingredientId: data.ingredientId,
          quantity: data.quantity,
          importPrice: data.importPrice,
          totalPrice: totalPrice,
          importDate: data.importDate,
          note: data.note,
          createdById: data.createdById,
        },
        select: importSelect,
      });

      // Update ingredient stock quantity
      await tx.ingredient.update({
        where: { id: data.ingredientId },
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
      note?: string;
    },
  ) {
    return prisma.$transaction(async (tx) => {
      const importRecord = await tx.inventoryImport.findUnique({
        where: { id },
        select: { ingredientId: true, importPrice: true },
      });

      if (!importRecord) return null;

      // Calculate new total price if quantity or price changed
      const updateData: Prisma.InventoryImportUpdateInput = { ...data };
      if (data.quantity !== undefined || data.importPrice !== undefined) {
        const newQuantity = data.quantity ?? oldQuantity;
        const newPrice = data.importPrice ?? Number(importRecord.importPrice);
        updateData.totalPrice = newQuantity * newPrice;
      }

      // Update stock quantity if quantity changed
      if (data.quantity !== undefined && data.quantity !== oldQuantity) {
        if (!importRecord.ingredientId) {
          throw new Error("Cannot update stock: ingredient not found");
        }
        const diff = data.quantity - oldQuantity;
        await tx.ingredient.update({
          where: { id: importRecord.ingredientId },
          data: {
            stockQuantity: { increment: diff },
          },
        });
      }

      return tx.inventoryImport.update({
        where: { id },
        data: updateData,
        select: importSelect,
      });
    });
  },

  async delete(id: string, quantity: number, ingredientId: string) {
    return prisma.$transaction(async (tx) => {
      // Delete import record
      await tx.inventoryImport.delete({
        where: { id },
      });

      // Decrease stock quantity
      await tx.ingredient.update({
        where: { id: ingredientId },
        data: {
          stockQuantity: { decrement: quantity },
        },
      });
    });
  },

  async getIngredient(id: string) {
    return prisma.ingredient.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    });
  },

  async getStats(from?: Date, to?: Date) {
    const where: Prisma.InventoryImportWhereInput = {};
    if (from || to) {
      where.importDate = {};
      if (from) where.importDate.gte = from;
      if (to) where.importDate.lte = to;
    }

    const result = await prisma.inventoryImport.aggregate({
      where,
      _sum: {
        totalPrice: true,
      },
      _count: true,
    });

    return {
      totalImports: result._count,
      totalCost: result._sum.totalPrice ?? 0,
    };
  },
};
