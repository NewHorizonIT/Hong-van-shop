import { prisma } from "@/lib/prisma";

export interface CategoryFilter {
  search?: string;
  isActive?: boolean;
}

export const categoryRepository = {
  async findAll(filter: CategoryFilter, page: number, limit: number) {
    const where: Record<string, unknown> = {};

    if (filter.search) {
      where.name = { contains: filter.search, mode: "insensitive" };
    }

    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        select: {
          id: true,
          name: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: { products: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.category.count({ where }),
    ]);

    return { categories, total };
  },

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { products: true },
        },
      },
    });
  },

  async findByName(name: string) {
    return prisma.category.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
      select: { id: true },
    });
  },

  async create(data: { name: string }) {
    return prisma.category.create({
      data: {
        name: data.name,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
      },
    });
  },

  async update(id: string, data: { name?: string; isActive?: boolean }) {
    return prisma.category.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { products: true },
        },
      },
    });
  },

  async delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  },

  async hasProducts(id: string) {
    const count = await prisma.product.count({
      where: { categoryId: id },
    });
    return count > 0;
  },
};
