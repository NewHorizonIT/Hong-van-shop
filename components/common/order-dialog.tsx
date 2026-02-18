"use client";

import React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import {
  Order,
  CreateOrderInput,
  CreateOrderItemInput,
  UpdateOrderInput,
} from "@/types/order";
import { Product, ProductVariant } from "@/types/product";
import { OrderStatus } from "@/types/api";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOrder: Order | null;
  products: (Product & { variants?: ProductVariant[] })[];
  onSave: (data: CreateOrderInput | UpdateOrderInput, isEdit: boolean) => void;
  isLoading?: boolean;
}

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "DONE", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

interface OrderItemForm {
  productId: string;
  productVariantId: string;
  quantity: number;
}

export function OrderDialog({
  open,
  onOpenChange,
  editingOrder,
  products,
  onSave,
  isLoading = false,
}: OrderDialogProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    address: "",
    deliveryTime: "",
    status: "PENDING" as OrderStatus,
    note: "",
    discount: 0,
  });

  const [items, setItems] = useState<OrderItemForm[]>([
    { productId: "", productVariantId: "", quantity: 1 },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (editingOrder) {
        setFormData({
          customerName: editingOrder.customerName,
          phone: editingOrder.phone,
          address: editingOrder.address,
          deliveryTime: editingOrder.deliveryTime
            ? new Date(editingOrder.deliveryTime).toISOString().slice(0, 16)
            : "",
          status: editingOrder.status,
          note: editingOrder.note || "",
          discount: editingOrder.discount || 0,
        });
        // Map existing order items
        if (editingOrder.items && editingOrder.items.length > 0) {
          setItems(
            editingOrder.items.map((item) => ({
              productId: item.productVariant?.productId || "",
              productVariantId:
                item.productVariantId || item.productVariant?.id || "",
              quantity: item.quantity,
            })),
          );
        } else {
          setItems([{ productId: "", productVariantId: "", quantity: 1 }]);
        }
      } else {
        setFormData({
          customerName: "",
          phone: "",
          address: "",
          deliveryTime: "",
          status: "PENDING",
          note: "",
          discount: 0,
        });
        setItems([{ productId: "", productVariantId: "", quantity: 1 }]);
      }
      setErrors({});
    }
  }, [open, editingOrder, products]);

  const getVariantsForProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product?.variants || [];
  };

  const handleItemChange = (
    index: number,
    field: keyof OrderItemForm,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        // Reset variant when product changes
        if (field === "productId") {
          updated.productVariantId = "";
        }
        return updated;
      }),
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { productId: "", productVariantId: "", quantity: 1 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Tên khách hàng là bắt buộc";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Địa chỉ là bắt buộc";
    }
    if (!formData.deliveryTime) {
      newErrors.deliveryTime = "Thời gian giao là bắt buộc";
    }

    // Validate items only for new orders (edit doesn't change items)
    if (!editingOrder) {
      const validItems = items.filter((item) => item.productVariantId);
      if (validItems.length === 0) {
        newErrors.items = "Vui lòng thêm ít nhất một sản phẩm";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (editingOrder) {
      // Update doesn't change order items
      const updateData: UpdateOrderInput = {
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        deliveryTime: new Date(formData.deliveryTime).toISOString(),
        status: formData.status,
        note: formData.note.trim() || undefined,
        discount: formData.discount || 0,
      };
      onSave(updateData, true);
    } else {
      const orderItems: CreateOrderItemInput[] = items
        .filter((item) => item.productVariantId)
        .map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        }));

      const createData: CreateOrderInput = {
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        deliveryTime: new Date(formData.deliveryTime).toISOString(),
        note: formData.note.trim() || undefined,
        discount: formData.discount || 0,
        items: orderItems,
      };
      onSave(createData, false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Calculate total
  const calculateTotal = () => {
    if (editingOrder) {
      // For editing, use the original subtotal (totalAmount + original discount) minus current discount
      const originalSubtotal =
        editingOrder.totalAmount + (editingOrder.discount || 0);
      return Math.max(0, originalSubtotal - (formData.discount || 0));
    }

    // For new orders, calculate from selected items
    let total = 0;
    items.forEach((item) => {
      if (item.productVariantId) {
        const variant = products
          .flatMap((p) => p.variants || [])
          .find((v) => v.id === item.productVariantId);
        if (variant) {
          total += variant.sellingPrice * item.quantity;
        }
      }
    });
    return Math.max(0, total - (formData.discount || 0));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingOrder ? "Chỉnh sửa đơn hàng" : "Tạo đơn hàng mới"}
          </DialogTitle>
          <DialogDescription>
            Điền thông tin đơn hàng bên dưới
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">
                Tên khách hàng <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customer"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                placeholder="Nhập tên khách hàng"
                aria-invalid={!!errors.customerName}
              />
              {errors.customerName && (
                <p className="text-sm text-destructive">
                  {errors.customerName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Nhập số điện thoại"
                aria-invalid={!!errors.phone}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              Địa chỉ <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Nhập địa chỉ giao hàng"
              aria-invalid={!!errors.address}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery">
                Thời gian giao <span className="text-destructive">*</span>
              </Label>
              <Input
                id="delivery"
                type="datetime-local"
                value={formData.deliveryTime}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryTime: e.target.value })
                }
                aria-invalid={!!errors.deliveryTime}
              />
              {errors.deliveryTime && (
                <p className="text-sm text-destructive">
                  {errors.deliveryTime}
                </p>
              )}
            </div>
            {editingOrder && (
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as OrderStatus })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                Sản phẩm{" "}
                {!editingOrder && <span className="text-destructive">*</span>}
              </Label>
              {!editingOrder && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm
                </Button>
              )}
            </div>

            {errors.items && (
              <p className="text-sm text-destructive">{errors.items}</p>
            )}

            {editingOrder ? (
              // Read-only view for existing order items
              <div className="space-y-2 rounded-md border border-border p-3 bg-muted/30">
                {editingOrder.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm"
                  >
                    <div>
                      <span className="font-medium">
                        {item.productVariant?.product?.name}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        - {item.productVariant?.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground">
                        x{item.quantity}
                      </span>
                      <span className="ml-2 font-medium">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-2">
                  * Không thể chỉnh sửa sản phẩm của đơn hàng đã tạo
                </p>
              </div>
            ) : (
              // Editable items for new orders
              items.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Sản phẩm
                    </Label>
                    <Select
                      value={item.productId}
                      onValueChange={(value) =>
                        handleItemChange(index, "productId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn sản phẩm" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Loại
                    </Label>
                    <Select
                      value={item.productVariantId}
                      onValueChange={(value) =>
                        handleItemChange(index, "productVariantId", value)
                      }
                      disabled={!item.productId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại" />
                      </SelectTrigger>
                      <SelectContent>
                        {getVariantsForProduct(item.productId).map(
                          (variant) => (
                            <SelectItem key={variant.id} value={variant.id}>
                              {variant.name} -{" "}
                              {formatPrice(variant.sellingPrice)}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-20 space-y-1">
                    <Label className="text-xs text-muted-foreground">SL</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 1,
                        )
                      }
                    />
                  </div>

                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Discount and Note */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Giảm giá (VNĐ)</Label>
              <Input
                id="discount"
                type="number"
                min={0}
                value={formData.discount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Tổng cộng</Label>
              <div className="h-9 flex items-center text-lg font-bold text-primary">
                {formatPrice(calculateTotal())}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              placeholder="Ghi chú thêm..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Đang xử lý..."
                : editingOrder
                  ? "Cập nhật"
                  : "Tạo đơn hàng"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
