import { z } from "zod";

export const createInventoryImportSchema = z.object({
  productVariantId: z.string().uuid("Invalid product variant ID"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  importPrice: z.coerce.number().min(0, "Import price must be positive"),
  importDate: z.coerce.date().optional(),
});

export const updateInventoryImportSchema = z.object({
  quantity: z.coerce.number().int().min(1).optional(),
  importPrice: z.coerce.number().min(0).optional(),
  importDate: z.coerce.date().optional(),
});

export const inventoryImportQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  productVariantId: z.string().uuid().optional(),
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
