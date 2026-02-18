import { Decimal } from "@/lib/generated/prisma/runtime/client";

export interface InventoryImportResponse {
  id: string;
  quantity: number;
  importPrice: Decimal;
  importDate: Date;
  productVariant: {
    id: string;
    name: string;
    unit: string;
    product: {
      id: string;
      name: string;
    };
  };
  createdBy: {
    id: string;
    name: string;
  };
}

export interface InventoryImportListResponse {
  imports: InventoryImportResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
