export interface CustomerResponse {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  note: string | null;
  createdAt: Date;
  _count?: {
    orders: number;
  };
}

export interface CustomerListResponse {
  customers: CustomerResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
