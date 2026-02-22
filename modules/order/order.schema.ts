import { z } from "zod";

export const orderItemSchema = z.object({
  productVariantId: z.string().uuid("Invalid product variant ID"),
  quantity: z.coerce.number().min(0.001, "Quantity must be greater than 0"),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required").max(100),
  phone: z.string().min(1, "Phone is required").max(20),
  address: z.string().min(1, "Address is required").max(500),
  deliveryTime: z.coerce.date(),
  note: z.string().max(500).optional(),
  discount: z.coerce.number().min(0).default(0),
  customerId: z.string().uuid().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

export const updateOrderSchema = z.object({
  customerName: z.string().min(1).max(100).optional(),
  phone: z.string().min(1).max(20).optional(),
  address: z.string().min(1).max(500).optional(),
  deliveryTime: z.coerce.date().optional(),
  note: z.string().max(500).optional().nullable(),
  discount: z.coerce.number().min(0).optional(),
  status: z.enum(["PENDING", "CONFIRMED", "DONE", "CANCELLED"]).optional(),
});

export const orderQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "DONE", "CANCELLED"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  sortBy: z
    .enum(["createdAt", "deliveryTime", "totalAmount", "customerName"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const upcomingOrdersSchema = z.object({
  hours: z.coerce.number().min(1).max(72).default(2),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type UpcomingOrdersInput = z.infer<typeof upcomingOrdersSchema>;
