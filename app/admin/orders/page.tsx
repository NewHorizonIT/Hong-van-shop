"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Plus, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OrderDialog } from "@/components/common/order-dialog";
import { OrdersTable } from "@/components/common/order-table";
import {
  useOrders,
  useCreateOrder,
  useUpdateOrder,
  useDeleteOrder,
} from "@/hooks/api/use-orders";
import { useProducts } from "@/hooks/api/use-products";
import { useExport } from "@/hooks/api/use-export";
import { getDateRange } from "@/hooks/api/use-reports";
import { Order, CreateOrderInput, UpdateOrderInput } from "@/types/order";
import { OrderStatus } from "@/types/api";

const statusTabs: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "DONE", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

type SortByType = "createdAt" | "deliveryTime" | "totalAmount" | "customerName";
type SortOrderType = "asc" | "desc";

const sortOptions: { value: SortByType; label: string }[] = [
  { value: "createdAt", label: "Ngày tạo" },
  { value: "deliveryTime", label: "Ngày giao" },
  { value: "totalAmount", label: "Tổng tiền" },
  { value: "customerName", label: "Tên khách" },
];

export default function OrdersPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">(
    "all",
  );
  const [sortBy, setSortBy] = useState<SortByType>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrderType>("desc");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { toast } = useToast();
  const {
    data: orders,
    isLoading: ordersLoading,
    error: ordersError,
  } = useOrders({
    status: selectedStatus === "all" ? undefined : selectedStatus,
    sortBy,
    sortOrder,
  });
  const { data: products, isLoading: productsLoading } = useProducts();

  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();
  const { exportOrders } = useExport();

  const getStatusCount = (status: OrderStatus) => {
    return orders?.filter((o) => o.status === status).length || 0;
  };

  const handleSaveOrder = async (
    data: CreateOrderInput | UpdateOrderInput,
    isEdit: boolean,
  ) => {
    setIsSubmitting(true);
    try {
      if (isEdit && editingOrder) {
        await updateOrder(editingOrder.id, data as UpdateOrderInput);
        toast({
          title: "Thành công",
          description: "Đơn hàng đã được cập nhật",
        });
      } else {
        await createOrder(data as CreateOrderInput);
        toast({
          title: "Thành công",
          description: "Đơn hàng mới đã được tạo",
        });
      }
      setOpenDialog(false);
      setEditingOrder(null);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteOrder(id);
      toast({
        title: "Thành công",
        description: "Đơn hàng đã được xóa",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Không thể xóa đơn hàng",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const dateRange = getDateRange("month");
      await exportOrders(dateRange);
      toast({
        title: "Thành công",
        description: "Đã xuất file Excel",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Không thể xuất file",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setOpenDialog(true);
  };

  const handleAddNew = () => {
    setEditingOrder(null);
    setOpenDialog(true);
  };

  if (ordersError) {
    return (
      <div className="p-6">
        <div className="text-center text-destructive">
          <p>Không thể tải danh sách đơn hàng</p>
          <p className="text-sm text-muted-foreground">
            {ordersError instanceof Error
              ? ordersError.message
              : "Vui lòng thử lại sau"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground">
            {orders?.length || 0} đơn hàng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Đang xuất..." : "Xuất Excel"}
          </Button>
          <Button onClick={handleAddNew} disabled={productsLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo đơn hàng
          </Button>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Sắp xếp:</span>
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortByType)}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrderType)}>
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Giảm dần</SelectItem>
            <SelectItem value="asc">Tăng dần</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs
        value={selectedStatus}
        onValueChange={(v) => setSelectedStatus(v as OrderStatus | "all")}
      >
        <TabsList className="flex-wrap h-auto">
          {statusTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-xs sm:text-sm"
            >
              {tab.label}
              {tab.value !== "all" && (
                <span className="ml-1 text-xs">
                  ({getStatusCount(tab.value)})
                </span>
              )}
              {tab.value === "all" && (
                <span className="ml-1 text-xs">({orders?.length || 0})</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedStatus} className="mt-4">
          {ordersLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <OrdersTable
              orders={orders || []}
              onEdit={handleEdit}
              onDelete={handleDeleteOrder}
            />
          )}
        </TabsContent>
      </Tabs>

      <OrderDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        editingOrder={editingOrder}
        products={products || []}
        onSave={handleSaveOrder}
        isLoading={isSubmitting}
      />
    </div>
  );
}
