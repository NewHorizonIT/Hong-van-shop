export interface CategoryResponse {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  _count?: {
    products: number;
  };
}

export interface CategoryListResponse {
  categories: CategoryResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
