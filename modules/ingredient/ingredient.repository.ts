import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";

export interface IngredientFilter {
  search?: string;
  isActive?: boolean;
}

const ingredientSelect = {
  id: true,
  name: true,
  unit: true,
  stockQuantity: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: { imports: true },
  },
};

export const ingredientRepository = {
  async findAll(filter: IngredientFilter, page: number, limit: number) {
    const where: Prisma.IngredientWhereInput = {};

    if (filter.search) {
      where.name = { contains: filter.search, mode: "insensitive" };
    }

    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    const [ingredients, total] = await Promise.all([
      prisma.ingredient.findMany({
        where,
        select: ingredientSelect,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ingredient.count({ where }),
    ]);

    return { ingredients, total };
  },

  async findAllActive() {
    return prisma.ingredient.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        unit: true,
        stockQuantity: true,
      },
      orderBy: { name: "asc" },
    });
  },

  async findById(id: string) {
    return prisma.ingredient.findUnique({
      where: { id },
      select: ingredientSelect,
    });
  },

  async findByName(name: string) {
    return prisma.ingredient.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
      select: { id: true },
    });
  },

  async create(data: { name: string; unit: string }) {
    return prisma.ingredient.create({
      data: {
        name: data.name,
        unit: data.unit,
        isActive: true,
      },
      select: ingredientSelect,
    });
  },

  async update(
    id: string,
    data: { name?: string; unit?: string; isActive?: boolean }
  ) {
    return prisma.ingredient.update({
      where: { id },
      data,
      select: ingredientSelect,
    });
  },

  async updateStock(id: string, quantity: Prisma.Decimal | number) {
    return prisma.ingredient.update({
      where: { id },
      data: {
        stockQuantity: { increment: quantity },
      },
    });
  },

  async delete(id: string) {
    return prisma.ingredient.delete({
      where: { id },
    });
  },

  async hasImports(id: string) {
    const count = await prisma.inventoryImport.count({
      where: { ingredientId: id },
    });
    return count > 0;
  },
};
