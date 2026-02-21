import { Decimal } from "@/lib/generated/prisma/runtime/client";

export interface ProductVariantResponse {
  id: string;
  name: string;
  unit: string;
  sellingPrice: Decimal;
  isActive: boolean;
  createdAt: Date;
}

export interface ProductResponse {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  variants: ProductVariantResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductListResponse {
  products: ProductResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
