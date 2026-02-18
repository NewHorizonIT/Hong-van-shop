import { prisma } from "@/lib/prisma";

export interface CustomerFilter {
  search?: string;
}

export const customerRepository = {
  async findAll(filter: CustomerFilter, page: number, limit: number) {
    const where: Record<string, unknown> = {};

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: "insensitive" } },
        { phone: { contains: filter.search, mode: "insensitive" } },
        { address: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          note: true,
          createdAt: true,
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);

    return { customers, total };
  },

  async findById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        note: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
    });
  },

  async findByPhone(phone: string) {
    return prisma.customer.findUnique({
      where: { phone },
      select: { id: true },
    });
  },

  async create(data: {
    name: string;
    phone: string;
    address?: string;
    note?: string;
  }) {
    return prisma.customer.create({
      data,
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        note: true,
        createdAt: true,
      },
    });
  },

  async update(
    id: string,
    data: {
      name?: string;
      phone?: string;
      address?: string | null;
      note?: string | null;
    },
  ) {
    return prisma.customer.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        note: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
    });
  },

  async delete(id: string) {
    return prisma.customer.delete({
      where: { id },
    });
  },

  async hasOrders(id: string) {
    const count = await prisma.order.count({
      where: { customerId: id },
    });
    return count > 0;
  },
};
