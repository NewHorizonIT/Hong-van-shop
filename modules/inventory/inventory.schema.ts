import { z } from "zod";

export const createInventoryImportSchema = z.object({
  ingredientId: z.string().uuid("ID nguyên liệu không hợp lệ"),
  quantity: z.coerce.number().min(0.01, "Số lượng phải lớn hơn 0"),
  importPrice: z.coerce.number().min(0, "Giá nhập phải >= 0"),
  importDate: z.coerce.date().optional(),
  note: z.string().optional(),
});

export const updateInventoryImportSchema = z.object({
  quantity: z.coerce.number().min(0.01).optional(),
  importPrice: z.coerce.number().min(0).optional(),
  importDate: z.coerce.date().optional(),
  note: z.string().optional(),
});

export const inventoryImportQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  ingredientId: z.string().uuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type CreateInventoryImportInput = z.infer<
  typeof createInventoryImportSchema
>;
export type UpdateInventoryImportInput = z.infer<
  typeof updateInventoryImportSchema
>;
export type InventoryImportQueryInput = z.infer<
  typeof inventoryImportQuerySchema
>;
