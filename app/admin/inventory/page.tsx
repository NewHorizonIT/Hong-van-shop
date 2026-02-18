"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useInventoryImports,
  useCreateInventoryImport,
  useDeleteInventoryImport,
} from "@/hooks/api/use-inventory";
import { useProducts } from "@/hooks/api/use-products";
import { useToast } from "@/hooks/use-toast";
import { InventoryImport, CreateInventoryImportInput } from "@/types/inventory";
import { Plus, Trash2, Package, DollarSign, TrendingUp } from "lucide-react";

export default function InventoryImportsPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteImport, setDeleteImport] = useState<InventoryImport | null>(
    null,
  );
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    quantity: 1,
    importPrice: 0,
    importDate: new Date().toISOString().slice(0, 16),
  });

  const { toast } = useToast();

  const {
    data: imports,
    total: totalImports,
    isLoading: importsLoading,
    error: importsError,
  } = useInventoryImports();
  const { data: products, isLoading: productsLoading } = useProducts();

  // Calculate stats from imports data
  const stats = useMemo(() => {
    if (!imports || imports.length === 0) {
      return {
        totalImports: totalImports || 0,
        totalQuantity: 0,
        totalCost: 0,
      };
    }

    let totalQuantity = 0;
    let totalCost = 0;

    imports.forEach((imp) => {
      totalQuantity += imp.quantity;
      totalCost += Number(imp.importPrice) * imp.quantity;
    });

    return {
      totalImports: totalImports || imports.length,
      totalQuantity,
      totalCost,
    };
  }, [imports, totalImports]);

  const createImport = useCreateInventoryImport();
  const deleteImportFn = useDeleteInventoryImport();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getVariantsForProduct = (productId: string) => {
    const product = products?.find((p) => p.id === productId);
    return product?.variants || [];
  };

  const resetForm = () => {
    setSelectedProductId("");
    setSelectedVariantId("");
    setFormData({
      quantity: 1,
      importPrice: 0,
      importDate: new Date().toISOString().slice(0, 16),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVariantId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn sản phẩm và loại",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const data: CreateInventoryImportInput = {
        productVariantId: selectedVariantId,
        quantity: formData.quantity,
        importPrice: formData.importPrice,
        importDate: new Date(formData.importDate).toISOString(),
      };

      await createImport(data);
      toast({
        title: "Thành công",
        description: "Đã nhập hàng thành công",
      });
      setOpenDialog(false);
      resetForm();
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

  const handleDelete = async () => {
    if (!deleteImport) return;

    try {
      await deleteImportFn(deleteImport.id);
      toast({
        title: "Thành công",
        description: "Đã xóa phiếu nhập hàng",
      });
      setDeleteImport(null);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive",
      });
    }
  };

  if (importsError) {
    return (
      <div className="p-6">
        <div className="text-destructive">
          Lỗi tải dữ liệu: {importsError.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Nhập hàng</h1>
          <p className="text-muted-foreground">
            Quản lý nhập hàng và theo dõi chi phí
          </p>
        </div>
        <Button onClick={() => setOpenDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nhập hàng mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng lần nhập</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalImports}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số lượng nhập
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuantity}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng chi phí nhập
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats.totalCost)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử nhập hàng</CardTitle>
        </CardHeader>
        <CardContent>
          {importsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !imports || imports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có phiếu nhập hàng nào
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày nhập</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead className="text-right">Giá nhập/đơn vị</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead>Người nhập</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imports.map((imp) => (
                  <TableRow key={imp.id}>
                    <TableCell>{formatDate(imp.importDate)}</TableCell>
                    <TableCell className="font-medium">
                      {imp.productVariant.product.name}
                    </TableCell>
                    <TableCell>
                      {imp.productVariant.name} ({imp.productVariant.unit})
                    </TableCell>
                    <TableCell className="text-right">{imp.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatPrice(Number(imp.importPrice))}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(Number(imp.importPrice) * imp.quantity)}
                    </TableCell>
                    <TableCell>{imp.createdBy.name}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteImport(imp)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Import Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle>Nhập hàng mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin hàng hóa cần nhập kho
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product">Sản phẩm</Label>
              <Select
                value={selectedProductId}
                onValueChange={(value) => {
                  setSelectedProductId(value);
                  setSelectedVariantId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant">Loại sản phẩm</Label>
              <Select
                value={selectedVariantId}
                onValueChange={setSelectedVariantId}
                disabled={!selectedProductId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  {getVariantsForProduct(selectedProductId).map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.name} ({variant.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Số lượng</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="importPrice">Giá nhập (VNĐ)</Label>
                <Input
                  id="importPrice"
                  type="number"
                  min={0}
                  value={formData.importPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      importPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="importDate">Ngày nhập</Label>
              <Input
                id="importDate"
                type="datetime-local"
                value={formData.importDate}
                onChange={(e) =>
                  setFormData({ ...formData, importDate: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpenDialog(false);
                  resetForm();
                }}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : "Nhập hàng"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteImport}
        onOpenChange={() => setDeleteImport(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa phiếu nhập hàng này? Số lượng tồn kho sẽ được
              cập nhật lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
