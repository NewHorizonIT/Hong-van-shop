"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/api/use-categories";
import { useToast } from "@/hooks/use-toast";
import { Category, CreateCategoryInput, UpdateCategoryInput } from "@/types/category";
import { Plus, Search, Pencil, Trash2, FolderOpen } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{ name: string; isActive: boolean }>({
    name: "",
    isActive: true,
  });

  const { toast } = useToast();
  const { data: categories, isLoading, error, mutate } = useCategories();

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategoryFn = useDeleteCategory();

  // Filter categories by search term
  const filteredCategories = categories?.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditCategory(null);
    setFormData({ name: "", isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditCategory(category);
    setFormData({ name: category.name, isActive: category.isActive });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên danh mục",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editCategory) {
        const updateData: UpdateCategoryInput = {
          name: formData.name,
          isActive: formData.isActive,
        };
        await updateCategory(editCategory.id, updateData);
        toast({
          title: "Thành công",
          description: "Danh mục đã được cập nhật",
        });
      } else {
        const createData: CreateCategoryInput = {
          name: formData.name,
        };
        await createCategory(createData);
        toast({
          title: "Thành công",
          description: "Danh mục mới đã được tạo",
        });
      }
      setIsModalOpen(false);
      setEditCategory(null);
      mutate();
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

  const handleDelete = (category: Category) => {
    setDeleteCategory(category);
  };

  const confirmDelete = async () => {
    if (!deleteCategory) return;

    try {
      await deleteCategoryFn(deleteCategory.id);
      toast({
        title: "Thành công",
        description: "Danh mục đã được xóa",
      });
      setDeleteCategory(null);
      mutate();
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error instanceof Error
            ? error.message
            : "Không thể xóa danh mục. Có thể có sản phẩm đang sử dụng danh mục này.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Lỗi tải dữ liệu: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Danh mục</h1>
          <p className="text-muted-foreground">
            Quản lý các danh mục sản phẩm
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filteredCategories?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <FolderOpen className="h-16 w-16 mb-4" />
          <p>Không có danh mục nào</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Tên danh mục</TableHead>
                <TableHead>Số sản phẩm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories?.map((category, index) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category._count?.products ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Hoạt động" : "Ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(category.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
            </DialogTitle>
            <DialogDescription>
              {editCategory
                ? "Cập nhật thông tin danh mục"
                : "Nhập thông tin để tạo danh mục mới"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên danh mục</Label>
              <Input
                id="name"
                placeholder="Nhập tên danh mục"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {editCategory && (
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.isActive ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isActive: value === "active" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Ẩn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : editCategory ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteCategory}
        onOpenChange={() => setDeleteCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa danh mục &quot;{deleteCategory?.name}&quot;?
              Hành động này không thể hoàn tác.
              {deleteCategory?._count?.products && deleteCategory._count.products > 0 && (
                <span className="block mt-2 text-red-500 font-medium">
                  Lưu ý: Danh mục này có {deleteCategory._count.products} sản phẩm.
                  Bạn cần chuyển các sản phẩm sang danh mục khác trước khi xóa.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
