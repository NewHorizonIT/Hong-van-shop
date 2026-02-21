import { prisma } from "@/lib/prisma";
import {
  CreateVariantInput,
  UpdateVariantInput,
  UpdateProductInput,
} from "./product.schema";
import { ValidationException } from "@/modules/common/api-error";

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
            productId: true,
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
            productId: true,
            createdAt: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async update(id: string, data: UpdateProductInput) {
    const { variants, ...productData } = data;

    return prisma.$transaction(async (tx) => {
      // Ensure product exists and update product fields if provided
      if (Object.keys(productData).length > 0) {
        await tx.product.update({ where: { id }, data: productData });
      } else {
        const exists = await tx.product.findUnique({
          where: { id },
          select: { id: true },
        });
        if (!exists) {
          throw new Error("Product not found");
        }
      }

      if (variants) {
        // Existing variants for the product
        const existing = await tx.productVariant.findMany({
          where: { productId: id },
          select: { id: true },
        });
        const existingIds = existing.map((e) => e.id);

        const incomingIds = variants
          .filter((v) => v.id)
          .map((v) => v.id as string);
        const toDelete = existingIds.filter(
          (eid) => !incomingIds.includes(eid),
        );

        // Check orders before deleting variants
        for (const delId of toDelete) {
          const count = await tx.orderItem.count({
            where: { productVariantId: delId },
          });
          if (count > 0) {
            throw new ValidationException(
              "Cannot delete variant with existing orders",
            );
          }
        }

        if (toDelete.length > 0) {
          await tx.productVariant.deleteMany({
            where: { id: { in: toDelete } },
          });
        }

        // Upsert incoming variants (update if id provided, create otherwise)
        for (const v of variants) {
          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                name: v.name,
                unit: v.unit || "phần",
                sellingPrice: v.sellingPrice,
              },
            });
          } else {
            await tx.productVariant.create({
              data: {
                productId: id,
                name: v.name,
                unit: v.unit || "phần",
                sellingPrice: v.sellingPrice,
                isActive: true,
              },
            });
          }
        }
      }

      // Return updated product with variants
      return tx.product.findUniqueOrThrow({
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
              productId: true,
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
        productId: true,
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
        productId: true,
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
