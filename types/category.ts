// Category types

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    products: number;
  };
}

export interface CreateCategoryInput {
  name: string;
}

export interface UpdateCategoryInput {
  name?: string;
  isActive?: boolean;
}
