import { Decimal } from "@/lib/generated/prisma/runtime/client";
import { OrderStatus } from "@/lib/generated/prisma";

export interface OrderItemResponse {
  id: string;
  quantity: Decimal;
  unitPrice: Decimal;
  costPrice: Decimal;
  subtotal: Decimal;
  productVariant: {
    id: string;
    name: string;
    unit: string;
    productId: string;
    product: {
      id: string;
      name: string;
    };
  };
}

export interface OrderResponse {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  deliveryTime: Date;
  status: OrderStatus;
  totalAmount: Decimal;
  totalCost: Decimal;
  totalProfit: Decimal;
  discount: Decimal;
  note: string | null;
  customerId: string | null;
  customer: {
    id: string;
    name: string;
    phone: string;
  } | null;
  createdBy: {
    id: string;
    name: string;
  };
  items: OrderItemResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderListResponse {
  orders: OrderResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
