// Ingredient types

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    imports: number;
  };
}

export interface CreateIngredientInput {
  name: string;
  unit?: string;
}

export interface UpdateIngredientInput {
  name?: string;
  unit?: string;
  isActive?: boolean;
}

export interface IngredientListResponse {
  ingredients: Ingredient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
