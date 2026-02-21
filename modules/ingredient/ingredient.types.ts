import { Decimal } from "@/lib/generated/prisma/runtime/library";

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  stockQuantity: Decimal | number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    imports: number;
  };
}

export interface IngredientListResponse {
  ingredients: Ingredient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type IngredientResponse = Ingredient;
