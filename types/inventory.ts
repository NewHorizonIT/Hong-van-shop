// Inventory Import types

import { ProductVariant } from "./product";
import { User } from "./user";

export interface InventoryImport {
  id: string;
  quantity: number;
  importPrice: number;
  importDate: string;
  productVariantId?: string;
  productVariant: {
    id: string;
    name: string;
    unit: string;
    productId?: string;
    product: {
      id: string;
      name: string;
    };
  };
  createdBy: Pick<User, "id" | "name">;
}

export interface CreateInventoryImportInput {
  productVariantId: string;
  quantity: number;
  importPrice: number;
  importDate?: string;
}

export interface UpdateInventoryImportInput {
  quantity?: number;
  importPrice?: number;
  importDate?: string;
}

export interface InventoryImportListResponse {
  imports: InventoryImport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
