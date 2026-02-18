"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Product, ProductVariant } from "@/types/product";
import { Category } from "@/types/category";

// Extended product type with relations for display
export interface ProductWithDetails extends Product {
  category?: Category;
  variants?: ProductVariant[];
}

interface ProductCardProps {
  product: ProductWithDetails;
  onEdit?: (product: ProductWithDetails) => void;
  onDelete?: (product: ProductWithDetails) => void;
  onToggleStatus?: (product: ProductWithDetails) => void;
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
  onToggleStatus,
}: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const isActive = product.isActive ?? true;
  
  // Get the min price from variants or 0
  const minPrice = product.variants?.length 
    ? Math.min(...product.variants.map(v => v.sellingPrice))
    : 0;
  
  // Get the default unit from first variant
  const displayUnit = product.variants?.[0]?.unit || "con";

  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 max-w-sm ${
        !isActive ? "opacity-60" : ""
      }`}
    >
      {/* Product Image Placeholder */}
      <div className="relative aspect-video bg-muted">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <span className="text-4xl">🍗</span>
        </div>
        {/* Category Badge */}
        <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
          {product.category?.name || "Chưa phân loại"}
        </span>
        {/* Status Badge */}
        <span
          className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium ${
            isActive ? "bg-green-500 text-white" : "bg-gray-400 text-white"
          }`}
        >
          {isActive ? "Đang bán" : "Ngừng bán"}
        </span>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-primary">
            {minPrice > 0 ? formatPrice(minPrice) : "Chưa có giá"}
          </span>
          {minPrice > 0 && (
            <span className="text-sm text-muted-foreground">/{displayUnit}</span>
          )}
        </div>

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Loại:</span>
            <div className="flex gap-1 flex-wrap">
              {product.variants.map((variant) => (
                <span
                  key={variant.id}
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    variant.isActive 
                      ? "bg-secondary" 
                      : "bg-gray-200 text-gray-500 line-through"
                  }`}
                >
                  {variant.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Product ID */}
        <div className="text-xs text-muted-foreground">ID: {product.id.slice(0, 8)}...</div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1"
          onClick={() => onEdit?.(product)}
        >
          <Pencil className="h-4 w-4" />
          Sửa
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => onToggleStatus?.(product)}
        >
          {isActive ? (
            <ToggleRight className="h-4 w-4 text-green-500" />
          ) : (
            <ToggleLeft className="h-4 w-4 text-gray-400" />
          )}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="gap-1"
          onClick={() => onDelete?.(product)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
