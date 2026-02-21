import { Decimal } from "@/lib/generated/prisma/runtime/client";

export interface InventoryImportResponse {
  id: string;
  quantity: Decimal | number;
  importPrice: Decimal | number;
  totalPrice: Decimal | number;
  importDate: Date;
  note: string | null;
  ingredient: {
    id: string;
    name: string;
    unit: string;
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
