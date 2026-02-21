import { prisma } from "@/lib/prisma";
import { OrderStatus, Prisma } from "@/lib/generated/prisma";
import { OrderItemInput } from "./order.schema";

export interface OrderFilter {
  search?: string;
  status?: OrderStatus;
  from?: Date;
  to?: Date;
  sortBy?: "createdAt" | "deliveryTime" | "totalAmount" | "customerName";
  sortOrder?: "asc" | "desc";
}

const orderSelect = {
  id: true,
  customerName: true,
  phone: true,
  address: true,
  deliveryTime: true,
  status: true,
  totalAmount: true,
  totalCost: true,
  totalProfit: true,
  discount: true,
  note: true,
  customerId: true,
  customer: {
    select: { id: true, name: true, phone: true },
  },
  createdBy: {
    select: { id: true, name: true },
  },
  items: {
    select: {
      id: true,
      quantity: true,
      unitPrice: true,
      costPrice: true,
      subtotal: true,
      productVariantId: true,
      productVariant: {
        select: {
          id: true,
          name: true,
          unit: true,
          productId: true,
          product: {
            select: { id: true, name: true },
          },
        },
      },
    },
  },
  createdAt: true,
  updatedAt: true,
};

export const orderRepository = {
  async findAll(filter: OrderFilter, page: number, limit: number) {
    const where: Prisma.OrderWhereInput = {};

    if (filter.search) {
      where.OR = [
        { customerName: { contains: filter.search, mode: "insensitive" } },
        { phone: { contains: filter.search, mode: "insensitive" } },
        { address: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.from || filter.to) {
      where.createdAt = {};
      if (filter.from) where.createdAt.gte = filter.from;
      if (filter.to) where.createdAt.lte = filter.to;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        select: orderSelect,
        orderBy: { [filter.sortBy || "createdAt"]: filter.sortOrder || "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  },

  async findUpcoming(hours: number) {
    const now = new Date();
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

    return prisma.order.findMany({
      where: {
        deliveryTime: {
          gte: now,
          lte: futureTime,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      select: orderSelect,
      orderBy: { deliveryTime: "asc" },
    });
  },

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      select: orderSelect,
    });
  },

  async create(
    data: {
      customerName: string;
      phone: string;
      address: string;
      deliveryTime: Date;
      note?: string;
      discount: number;
      customerId?: string;
      createdById: string;
      totalAmount: number;
      totalCost: number;
      totalProfit: number;
    },
    items: Array<{
      productVariantId: string;
      quantity: number;
      unitPrice: number;
      costPrice: number;
      subtotal: number;
    }>,
  ) {
    return prisma.order.create({
      data: {
        customerName: data.customerName,
        phone: data.phone,
        address: data.address,
        deliveryTime: data.deliveryTime,
        note: data.note,
        discount: data.discount,
        customerId: data.customerId,
        createdById: data.createdById,
        totalAmount: data.totalAmount,
        totalCost: data.totalCost,
        totalProfit: data.totalProfit,
        status: "PENDING",
        items: {
          create: items,
        },
      },
      select: orderSelect,
    });
  },

  async update(
    id: string,
    data: {
      customerName?: string;
      phone?: string;
      address?: string;
      deliveryTime?: Date;
      note?: string | null;
      discount?: number;
      status?: OrderStatus;
    },
  ) {
    return prisma.order.update({
      where: { id },
      data,
      select: orderSelect,
    });
  },

  async delete(id: string) {
    return prisma.order.delete({
      where: { id },
    });
  },

  async getVariantPrices(variantIds: string[]) {
    return prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: {
        id: true,
        sellingPrice: true,
        isActive: true,
      },
    });
  },
};
