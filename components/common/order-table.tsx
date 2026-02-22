"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Order } from "@/types/order";
import { OrderStatus } from "@/types/api";

const statusConfig: Record<
  OrderStatus,
  { bg: string; text: string; label: string }
> = {
  PENDING: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    label: "Chờ xác nhận",
  },
  CONFIRMED: { bg: "bg-blue-100", text: "text-blue-700", label: "Đã xác nhận" },
  DONE: { bg: "bg-green-100", text: "text-green-700", label: "Hoàn thành" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-700", label: "Đã hủy" },
};

interface OrdersTableProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function OrdersTable({
  orders,
  onEdit,
  onDelete,
  isLoading,
}: OrdersTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(price));
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (orders.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Không có đơn hàng nào</p>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-secondary/30">
              <TableHead className="text-foreground font-semibold">
                Mã đơn
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Khách hàng
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                SĐT
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Địa chỉ
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Thời gian giao
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Tổng tiền
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Trạng thái
              </TableHead>
              <TableHead className="text-foreground font-semibold text-right">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const status = statusConfig[order.status];
              return (
                <TableRow
                  key={order.id}
                  className="border-b border-border hover:bg-secondary/30"
                >
                  <TableCell className="font-medium text-foreground">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="text-foreground">
                    {order.customerName}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {order.phone}
                  </TableCell>
                  <TableCell className="text-foreground text-sm max-w-[200px] truncate">
                    {order.address}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {formatDateTime(order.deliveryTime)}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {formatPrice(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${status.bg} ${status.text}`}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(order)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive bg-transparent"
                      onClick={() => setDeleteId(order.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogTitle>Xóa đơn hàng?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn
            tác.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end mt-4">
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  setDeleteId(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
