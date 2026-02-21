"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  useIngredients,
  useCreateIngredient,
  useUpdateIngredient,
  useDeleteIngredient,
} from "@/hooks/api/use-ingredients";
import { useToast } from "@/hooks/use-toast";
import {
  Ingredient,
  CreateIngredientInput,
  UpdateIngredientInput,
} from "@/types/ingredient";
import { Plus, Search, Pencil, Trash2, Leaf } from "lucide-react";
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

export default function IngredientsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIngredient, setEditIngredient] = useState<Ingredient | null>(null);
  const [deleteIngredient, setDeleteIngredient] = useState<Ingredient | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    unit: string;
    isActive: boolean;
  }>({
    name: "",
    unit: "kg",
    isActive: true,
  });

  const { toast } = useToast();
  const { data: ingredients, isLoading, error, mutate } = useIngredients();

  const createIngredient = useCreateIngredient();
  const updateIngredient = useUpdateIngredient();
  const deleteIngredientFn = useDeleteIngredient();

  // Filter ingredients by search term
  const filteredIngredients = ingredients?.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditIngredient(null);
    setFormData({ name: "", unit: "kg", isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (ingredient: Ingredient) => {
    setEditIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      unit: ingredient.unit,
      isActive: ingredient.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên nguyên liệu",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editIngredient) {
        const updateData: UpdateIngredientInput = {
          name: formData.name,
          unit: formData.unit,
          isActive: formData.isActive,
        };
        await updateIngredient(editIngredient.id, updateData);
        toast({
          title: "Thành công",
          description: "Nguyên liệu đã được cập nhật",
        });
      } else {
        const createData: CreateIngredientInput = {
          name: formData.name,
          unit: formData.unit,
        };
        await createIngredient(createData);
        toast({
          title: "Thành công",
          description: "Nguyên liệu mới đã được tạo",
        });
      }
      setIsModalOpen(false);
      setEditIngredient(null);
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

  const handleDelete = (ingredient: Ingredient) => {
    setDeleteIngredient(ingredient);
  };

  const confirmDelete = async () => {
    if (!deleteIngredient) return;

    try {
      await deleteIngredientFn(deleteIngredient.id);
      toast({
        title: "Thành công",
        description: "Nguyên liệu đã được xóa",
      });
      setDeleteIngredient(null);
      mutate();
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error instanceof Error
            ? error.message
            : "Không thể xóa nguyên liệu. Vui lòng ẩn nếu đã có lịch sử nhập hàng.",
        variant: "destructive",
      });
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
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
          <h1 className="text-2xl font-bold">Quản lý Nguyên liệu</h1>
          <p className="text-muted-foreground">
            Quản lý các nguyên liệu nhập kho
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm nguyên liệu
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Tìm kiếm nguyên liệu..."
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
      ) : filteredIngredients?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Leaf className="h-16 w-16 mb-4" />
          <p>Không có nguyên liệu nào</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Tên nguyên liệu</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead className="text-right">Tồn kho</TableHead>
                <TableHead>Số lần nhập</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIngredients?.map((ingredient, index) => (
                <TableRow key={ingredient.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    {ingredient.name}
                  </TableCell>
                  <TableCell>{ingredient.unit}</TableCell>
                  <TableCell className="text-right">
                    {formatNumber(Number(ingredient.stockQuantity))}
                  </TableCell>
                  <TableCell>{ingredient._count?.imports ?? 0}</TableCell>
                  <TableCell>
                    <Badge
                      variant={ingredient.isActive ? "default" : "secondary"}
                    >
                      {ingredient.isActive ? "Hoạt động" : "Ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(ingredient.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(ingredient)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(ingredient)}
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
              {editIngredient ? "Sửa nguyên liệu" : "Thêm nguyên liệu mới"}
            </DialogTitle>
            <DialogDescription>
              {editIngredient
                ? "Cập nhật thông tin nguyên liệu"
                : "Nhập thông tin để tạo nguyên liệu mới"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên nguyên liệu</Label>
              <Input
                id="name"
                placeholder="Nhập tên nguyên liệu"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Đơn vị tính</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) =>
                  setFormData({ ...formData, unit: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đơn vị" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg (Kilogram)</SelectItem>
                  <SelectItem value="g">g (Gram)</SelectItem>
                  <SelectItem value="con">con</SelectItem>
                  <SelectItem value="lít">lít</SelectItem>
                  <SelectItem value="ml">ml (Mililit)</SelectItem>
                  <SelectItem value="bó">bó</SelectItem>
                  <SelectItem value="bịch">bịch</SelectItem>
                  <SelectItem value="hộp">hộp</SelectItem>
                  <SelectItem value="chai">chai</SelectItem>
                  <SelectItem value="cái">cái</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editIngredient && (
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
              {isSubmitting
                ? "Đang lưu..."
                : editIngredient
                  ? "Cập nhật"
                  : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteIngredient}
        onOpenChange={() => setDeleteIngredient(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nguyên liệu &quot;{deleteIngredient?.name}
              &quot;? Hành động này không thể hoàn tác.
              {deleteIngredient?._count?.imports &&
                deleteIngredient._count.imports > 0 && (
                  <span className="block mt-2 text-red-500 font-medium">
                    Lưu ý: Nguyên liệu này có {deleteIngredient._count.imports}{" "}
                    lần nhập hàng. Bạn nên ẩn thay vì xóa.
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
