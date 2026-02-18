"use client";

import { useState } from "react";
import ProductCard, { ProductWithDetails } from "@/components/common/product-card";
import ProductModal from "@/components/modal/product-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/api/use-products";
import { useCategories } from "@/hooks/api/use-categories";
import { useToast } from "@/hooks/use-toast";
import { CreateProductInput, UpdateProductInput } from "@/types/product";
import { Plus, Search } from "lucide-react";
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
import { apiClient } from "@/lib/api-client";

export default function ProductsPage() {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductWithDetails | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<ProductWithDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { data: products, isLoading: productsLoading, error: productsError, mutate: mutateProducts } = useProducts(
    selectedCategory || undefined
  );
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProductFn = useDeleteProduct();

  // Filter products by search term
  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (data: CreateProductInput & { id?: string }) => {
    setIsSubmitting(true);
    try {
      if (data.id) {
        // Update existing product
        const updateData: UpdateProductInput = {
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
        };
        await updateProduct(data.id, updateData);
        
        // Update variants separately if needed
        // Note: In a real app, you'd want to handle variant updates more carefully
        toast({
          title: "Thành công",
          description: "Sản phẩm đã được cập nhật",
        });
      } else {
        // Create new product
        await createProduct(data);
        toast({
          title: "Thành công",
          description: "Sản phẩm mới đã được tạo",
        });
      }
      setIsProductModalOpen(false);
      setEditProduct(null);
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

  const handleDelete = async (product: ProductWithDetails) => {
    setDeleteProduct(product);
  };

  const confirmDelete = async () => {
    if (!deleteProduct) return;
    
    try {
      await deleteProductFn(deleteProduct.id);
      toast({
        title: "Thành công",
        description: "Sản phẩm đã được xóa",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa sản phẩm",
        variant: "destructive",
      });
    } finally {
      setDeleteProduct(null);
    }
  };

  const handleToggleStatus = async (product: ProductWithDetails) => {
    try {
      await apiClient.patch(`/products/${product.id}`, {
        isActive: !product.isActive,
      });
      mutateProducts();
      toast({
        title: "Thành công",
        description: product.isActive ? "Sản phẩm đã ngừng bán" : "Sản phẩm đã được kích hoạt",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: ProductWithDetails) => {
    setEditProduct(product);
    setIsProductModalOpen(true);
  };

  const handleAddNew = () => {
    setEditProduct(null);
    setIsProductModalOpen(true);
  };

  if (productsError) {
    return (
      <div className="p-6">
        <div className="text-center text-destructive">
          <p>Không thể tải danh sách sản phẩm</p>
          <p className="text-sm text-muted-foreground">
            {productsError instanceof Error ? productsError.message : "Vui lòng thử lại sau"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
          <p className="text-muted-foreground">
            {products?.length || 0} sản phẩm
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:border-ring"
        >
          <option value="">Tất cả danh mục</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {productsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product as ProductWithDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory
              ? "Không tìm thấy sản phẩm nào phù hợp"
              : "Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!"}
          </p>
        </div>
      )}

      {/* Product Modal */}
      <ProductModal
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        product={editProduct}
        categories={categories || []}
        onSave={handleSave}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm &quot;{deleteProduct?.name}&quot;? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
