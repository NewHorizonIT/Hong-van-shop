import { z } from "zod";

export const createVariantSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  unit: z.string().min(1, "Unit is required").max(50).default("phần"),
  costPrice: z.coerce.number().min(0, "Cost price must be positive"),
  sellingPrice: z.coerce.number().min(0, "Selling price must be positive"),
  stockQuantity: z.coerce.number().int().min(0).default(0),
});

export const updateVariantSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  unit: z.string().min(1).max(50).optional(),
  costPrice: z.coerce.number().min(0).optional(),
  sellingPrice: z.coerce.number().min(0).optional(),
  stockQuantity: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
  categoryId: z.string().uuid("Invalid category ID"),
  variants: z
    .array(createVariantSchema)
    .min(1, "At least one variant is required"),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  categoryId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export const productQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
