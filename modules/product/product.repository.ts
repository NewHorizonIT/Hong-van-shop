import { prisma } from "@/lib/prisma";
import { CreateVariantInput, UpdateVariantInput } from "./product.schema";

export interface ProductFilter {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}

export const productRepository = {
  async findAll(filter: ProductFilter, page: number, limit: number) {
    const where: Record<string, unknown> = {};

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: "insensitive" } },
        { description: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    if (filter.categoryId) {
      where.categoryId = filter.categoryId;
    }

    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          categoryId: true,
          category: {
            select: { id: true, name: true },
          },
          variants: {
            select: {
              id: true,
              name: true,
              unit: true,
              sellingPrice: true,
              isActive: true,
              productId: true,
              createdAt: true,
            },
            orderBy: { createdAt: "asc" },
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  },

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        categoryId: true,
        category: {
          select: { id: true, name: true },
        },
        variants: {
          select: {
            id: true,
            name: true,
            unit: true,
            sellingPrice: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async create(data: {
    name: string;
    description?: string;
    categoryId: string;
    variants: CreateVariantInput[];
  }) {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        isActive: true,
        variants: {
          create: data.variants.map((v) => ({
            name: v.name,
            unit: v.unit || "phần",
            sellingPrice: v.sellingPrice,
            isActive: true,
          })),
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        categoryId: true,
        category: {
          select: { id: true, name: true },
        },
        variants: {
          select: {
            id: true,
            name: true,
            unit: true,
            sellingPrice: true,
            isActive: true,
            createdAt: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      categoryId?: string;
      isActive?: boolean;
    },
  ) {
    return prisma.product.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        categoryId: true,
        category: {
          select: { id: true, name: true },
        },
        variants: {
          select: {
            id: true,
            name: true,
            unit: true,
            sellingPrice: true,
            isActive: true,
            createdAt: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async delete(id: string) {
    // Delete variants first, then delete product (in transaction)
    return prisma.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({
        where: { productId: id },
      });
      return tx.product.delete({
        where: { id },
      });
    });
  },

  // Variant operations
  async findVariantById(id: string) {
    return prisma.productVariant.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        unit: true,
        sellingPrice: true,
        isActive: true,
        productId: true,
        createdAt: true,
      },
    });
  },

  async createVariant(productId: string, data: CreateVariantInput) {
    return prisma.productVariant.create({
      data: {
        productId,
        name: data.name,
        unit: data.unit || "phần",
        sellingPrice: data.sellingPrice,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        unit: true,
        sellingPrice: true,
        isActive: true,
        createdAt: true,
      },
    });
  },

  async updateVariant(id: string, data: UpdateVariantInput) {
    return prisma.productVariant.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        unit: true,
        sellingPrice: true,
        isActive: true,
        createdAt: true,
      },
    });
  },

  async deleteVariant(id: string) {
    return prisma.productVariant.delete({
      where: { id },
    });
  },

  async hasVariantOrders(variantId: string) {
    const count = await prisma.orderItem.count({
      where: { productVariantId: variantId },
    });
    return count > 0;
  },

  async hasProductOrders(productId: string) {
    const count = await prisma.orderItem.count({
      where: { productVariant: { productId } },
    });
    return count > 0;
  },
};
