"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import {
  Product,
  ProductVariant,
  CreateProductInput,
  CreateVariantInput,
} from "@/types/product";
import { Category } from "@/types/category";

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?:
    | (Product & { category?: Category; variants?: ProductVariant[] })
    | null;
  categories: Category[];
  onSave: (data: CreateProductInput & { id?: string }) => void;
  isLoading?: boolean;
}

interface VariantFormData {
  id?: string;
  name: string;
  sellingPrice: string;
  unit: string;
}

const DEFAULT_VARIANT: VariantFormData = {
  name: "",
  sellingPrice: "",
  unit: "con",
};

export default function ProductModal({
  open,
  onOpenChange,
  product,
  categories,
  onSave,
  isLoading = false,
}: ProductModalProps) {
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    isActive: true,
  });

  const [variants, setVariants] = useState<VariantFormData[]>([
    { ...DEFAULT_VARIANT },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when product changes or modal opens
  useEffect(() => {
    if (open) {
      if (product) {
        setFormData({
          name: product.name,
          description: product.description || "",
          categoryId: product.categoryId,
          isActive: product.isActive ?? true,
        });
        setVariants(
          product.variants && product.variants.length > 0
            ? product.variants.map((v) => ({
                id: v.id,
                name: v.name,
                sellingPrice: v.sellingPrice.toString(),
                unit: v.unit,
              }))
            : [{ ...DEFAULT_VARIANT }],
        );
      } else {
        setFormData({
          name: "",
          description: "",
          categoryId: categories[0]?.id || "",
          isActive: true,
        });
        setVariants([{ ...DEFAULT_VARIANT }]);
      }
      setErrors({});
    }
  }, [open, product, categories]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleVariantChange = (
    index: number,
    field: keyof VariantFormData,
    value: string,
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    );
    // Clear variant errors
    if (errors[`variant_${index}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`variant_${index}_${field}`]: "" }));
    }
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, { ...DEFAULT_VARIANT }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên sản phẩm là bắt buộc";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Vui lòng chọn danh mục";
    }

    // Validate variants
    variants.forEach((variant, index) => {
      if (!variant.name.trim()) {
        newErrors[`variant_${index}_name`] = "Tên loại là bắt buộc";
      }
      if (!variant.sellingPrice || Number(variant.sellingPrice) <= 0) {
        newErrors[`variant_${index}_sellingPrice`] = "Giá bán phải lớn hơn 0";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const variantsData: CreateVariantInput[] = variants.map((v) => ({
      name: v.name.trim(),
      sellingPrice: Number(v.sellingPrice),
      unit: v.unit,
    }));

    onSave({
      ...(product?.id && { id: product.id }),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      categoryId: formData.categoryId,
      variants: variantsData,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Cập nhật thông tin sản phẩm"
              : "Điền thông tin để tạo sản phẩm mới"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-4">
          {/* Product Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tên sản phẩm <span className="text-destructive">*</span>
            </label>
            <Input
              name="name"
              placeholder="VD: Gà bó xôi"
              value={formData.name}
              onChange={handleInputChange}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả</label>
            <textarea
              name="description"
              placeholder="Mô tả sản phẩm..."
              value={formData.description}
              onChange={handleInputChange}
              rows={2}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:border-ring"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Danh mục <span className="text-destructive">*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:border-ring"
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-sm text-destructive">{errors.categoryId}</p>
            )}
          </div>

          {/* Variants */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Loại sản phẩm <span className="text-destructive">*</span>
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVariant}
              >
                <Plus className="h-4 w-4 mr-1" />
                Thêm loại
              </Button>
            </div>

            {variants.map((variant, index) => (
              <div
                key={index}
                className="p-3 border rounded-lg space-y-3 relative"
              >
                {variants.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeVariant(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {/* Variant Name */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      Tên loại <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="VD: Cỡ X"
                      value={variant.name}
                      onChange={(e) =>
                        handleVariantChange(index, "name", e.target.value)
                      }
                      className="h-8 text-sm"
                      aria-invalid={!!errors[`variant_${index}_name`]}
                    />
                    {errors[`variant_${index}_name`] && (
                      <p className="text-xs text-destructive">
                        {errors[`variant_${index}_name`]}
                      </p>
                    )}
                  </div>

                  {/* Unit */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      Đơn vị
                    </label>
                    <select
                      value={variant.unit}
                      onChange={(e) =>
                        handleVariantChange(index, "unit", e.target.value)
                      }
                      className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm"
                    >
                      <option value="con">Con</option>
                      <option value="kg">Kg</option>
                      <option value="phần">Phần</option>
                      <option value="gói">Gói</option>
                    </select>
                  </div>
                </div>

                {/* Selling Price */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Giá bán <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="250000"
                    value={variant.sellingPrice}
                    onChange={(e) =>
                      handleVariantChange(index, "sellingPrice", e.target.value)
                    }
                    className="h-8 text-sm"
                    aria-invalid={!!errors[`variant_${index}_sellingPrice`]}
                  />
                  {errors[`variant_${index}_sellingPrice`] && (
                    <p className="text-xs text-destructive">
                      {errors[`variant_${index}_sellingPrice`]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Status Toggle */}
          {isEditing && (
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Trạng thái</p>
                <p className="text-xs text-muted-foreground">
                  {formData.isActive
                    ? "Sản phẩm đang được bán"
                    : "Sản phẩm đã ngừng bán"}
                </p>
              </div>
              <Button
                type="button"
                variant={formData.isActive ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
                }
              >
                {formData.isActive ? "Đang bán" : "Ngừng bán"}
              </Button>
            </div>
          )}

          {/* Footer Buttons */}
          <SheetFooter className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Huỷ
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Tạo mới"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
