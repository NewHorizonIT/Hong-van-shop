// Customer types

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  note: string | null;
  createdAt: string;
  // Aggregated fields from API
  orderCount?: number;
  totalSpent?: number;
  _count?: {
    orders: number;
  };
}

export interface CreateCustomerInput {
  name: string;
  phone: string;
  address?: string;
  note?: string;
}

export interface UpdateCustomerInput {
  name?: string;
  phone?: string;
  address?: string;
  note?: string;
}
