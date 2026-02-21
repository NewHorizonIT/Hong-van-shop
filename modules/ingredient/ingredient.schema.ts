import { z } from "zod";

export const createIngredientSchema = z.object({
  name: z.string().min(1, "Tên nguyên liệu không được để trống"),
  unit: z.string().min(1, "Đơn vị không được để trống").default("kg"),
});

export const updateIngredientSchema = z.object({
  name: z.string().min(1, "Tên nguyên liệu không được để trống").optional(),
  unit: z.string().min(1, "Đơn vị không được để trống").optional(),
  isActive: z.boolean().optional(),
});

export const ingredientQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});

export type CreateIngredientInput = z.infer<typeof createIngredientSchema>;
export type UpdateIngredientInput = z.infer<typeof updateIngredientSchema>;
export type IngredientQueryInput = z.infer<typeof ingredientQuerySchema>;
