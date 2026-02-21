import { orderRepository } from "./order.repository";
import {
  CreateOrderInput,
  UpdateOrderInput,
  OrderQueryInput,
  UpcomingOrdersInput,
} from "./order.schema";
import { OrderListResponse, OrderResponse } from "./order.types";
import {
  NotFoundException,
  ValidationException,
} from "@/modules/common/api-error";

export const orderService = {
  async findAll(query: OrderQueryInput): Promise<OrderListResponse> {
    const { page, limit, search, status, from, to, sortBy, sortOrder } = query;

    const { orders, total } = await orderRepository.findAll(
      { search, status, from, to, sortBy, sortOrder },
      page,
      limit,
    );

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findUpcoming(query: UpcomingOrdersInput): Promise<OrderResponse[]> {
    return orderRepository.findUpcoming(query.hours);
  },

  async findById(id: string): Promise<OrderResponse> {
    const order = await orderRepository.findById(id);

    if (!order) {
      throw new NotFoundException("Order");
    }

    return order;
  },

  async create(
    input: CreateOrderInput,
    createdById: string,
  ): Promise<OrderResponse> {
    // Get variant prices
    const variantIds = input.items.map((item) => item.productVariantId);
    const variants = await orderRepository.getVariantPrices(variantIds);

    // Validate all variants exist and are active
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    for (const item of input.items) {
      const variant = variantMap.get(item.productVariantId);
      if (!variant) {
        throw new ValidationException(
          `Product variant ${item.productVariantId} not found`,
        );
      }
      if (!variant.isActive) {
        throw new ValidationException(
          `Product variant ${item.productVariantId} is not active`,
        );
      }
    }

    // Calculate totals
    let totalAmount = 0;

    const orderItems = input.items.map((item) => {
      const variant = variantMap.get(item.productVariantId)!;
      const unitPrice = Number(variant.sellingPrice);
      const subtotal = unitPrice * item.quantity;

      totalAmount += subtotal;

      return {
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        unitPrice,
        costPrice: 0, // Cost tracking moved to ingredients
        subtotal,
      };
    });

    // Apply discount
    const discount = input.discount || 0;
    totalAmount -= discount;
    const totalCost = 0; // Cost tracking moved to ingredients
    const totalProfit = totalAmount; // Profit = revenue when cost is tracked separately

    return orderRepository.create(
      {
        customerName: input.customerName,
        phone: input.phone,
        address: input.address,
        deliveryTime: input.deliveryTime,
        note: input.note,
        discount,
        customerId: input.customerId,
        createdById,
        totalAmount,
        totalCost,
        totalProfit,
      },
      orderItems,
    );
  },

  async update(id: string, input: UpdateOrderInput): Promise<OrderResponse> {
    const existing = await orderRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Order");
    }

    // Don't allow updating cancelled or done orders
    if (existing.status === "CANCELLED" || existing.status === "DONE") {
      if (input.status !== "CANCELLED" && input.status !== "DONE") {
        throw new ValidationException(
          "Cannot update completed or cancelled orders",
        );
      }
    }

    return orderRepository.update(id, input);
  },

  async delete(id: string): Promise<void> {
    const existing = await orderRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Order");
    }

    // Only allow deleting pending orders
    if (existing.status !== "PENDING") {
      throw new ValidationException("Can only delete pending orders");
    }

    await orderRepository.delete(id);
  },
};
