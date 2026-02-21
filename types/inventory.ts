// Inventory Import types

import { User } from "./user";
import { Ingredient } from "./ingredient";

export interface InventoryImport {
  id: string;
  quantity: number;
  importPrice: number;
  totalPrice: number;
  importDate: string;
  note: string | null;
  ingredientId?: string;
  ingredient: {
    id: string;
    name: string;
    unit: string;
  };
  createdBy: Pick<User, "id" | "name">;
}

export interface CreateInventoryImportInput {
  ingredientId: string;
  quantity: number;
  importPrice: number;
  importDate?: string;
  note?: string;
}

export interface UpdateInventoryImportInput {
  quantity?: number;
  importPrice?: number;
  importDate?: string;
  note?: string;
}

export interface InventoryImportListResponse {
  imports: InventoryImport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
