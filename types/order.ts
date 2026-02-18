// Order types

import { OrderStatus } from "./api";
import { Customer } from "./customer";
import { ProductVariant } from "./product";
import { User } from "./user";

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  subtotal: number;
  productVariantId: string;
  productVariant?: ProductVariant & {
    productId?: string;
    product?: { id?: string; name: string };
  };
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  deliveryTime: string;
  status: OrderStatus;
  totalAmount: number;
  totalCost: number;
  totalProfit: number;
  discount: number;
  note: string | null;
  customerId: string | null;
  customer?: Customer | null;
  createdById: string;
  createdBy?: Pick<User, "id" | "name">;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemInput {
  productVariantId: string;
  quantity: number;
}

export interface CreateOrderInput {
  customerName: string;
  phone: string;
  address: string;
  deliveryTime: string;
  note?: string;
  discount?: number;
  customerId?: string;
  items: CreateOrderItemInput[];
}

export interface UpdateOrderInput {
  customerName?: string;
  phone?: string;
  address?: string;
  deliveryTime?: string;
  status?: OrderStatus;
  note?: string;
  discount?: number;
  items?: CreateOrderItemInput[];
}

// For upcoming orders notification
export interface UpcomingOrdersParams {
  hours?: number; // Default 2 hours
}
