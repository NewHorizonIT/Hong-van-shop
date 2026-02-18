// Product types

import { Category } from "./category";

export interface ProductVariant {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  unit: string;
  isActive: boolean;
  productId: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  categoryId: string;
  category?: Category;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  categoryId: string;
  variants?: CreateVariantInput[];
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  categoryId?: string;
  isActive?: boolean;
}

export interface CreateVariantInput {
  name: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity?: number;
  unit?: string;
}

export interface UpdateVariantInput {
  name?: string;
  costPrice?: number;
  sellingPrice?: number;
  stockQuantity?: number;
  unit?: string;
  isActive?: boolean;
}

// For UI display
export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
  category: Category;
}
