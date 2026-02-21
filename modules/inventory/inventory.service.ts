import { inventoryRepository } from "./inventory.repository";
import {
  CreateInventoryImportInput,
  UpdateInventoryImportInput,
  InventoryImportQueryInput,
} from "./inventory.schema";
import {
  InventoryImportListResponse,
  InventoryImportResponse,
} from "./inventory.types";
import {
  NotFoundException,
  ValidationException,
} from "@/modules/common/api-error";

export const inventoryService = {
  async findAll(
    query: InventoryImportQueryInput
  ): Promise<InventoryImportListResponse> {
    const { page, limit, ingredientId, from, to } = query;

    const { imports, total } = await inventoryRepository.findAll(
      { ingredientId, from, to },
      page,
      limit
    );

    return {
      imports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string): Promise<InventoryImportResponse> {
    const importRecord = await inventoryRepository.findById(id);

    if (!importRecord) {
      throw new NotFoundException("Phiếu nhập");
    }

    return importRecord;
  },

  async create(
    input: CreateInventoryImportInput,
    createdById: string
  ): Promise<InventoryImportResponse> {
    // Validate ingredient exists
    const ingredient = await inventoryRepository.getIngredient(
      input.ingredientId
    );
    if (!ingredient) {
      throw new ValidationException("Nguyên liệu không tồn tại");
    }
    if (!ingredient.isActive) {
      throw new ValidationException("Nguyên liệu đã bị ẩn");
    }

    return inventoryRepository.create({
      ingredientId: input.ingredientId,
      quantity: input.quantity,
      importPrice: input.importPrice,
      importDate: input.importDate || new Date(),
      note: input.note,
      createdById,
    });
  },

  async update(
    id: string,
    input: UpdateInventoryImportInput
  ): Promise<InventoryImportResponse> {
    const existing = await inventoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Phiếu nhập");
    }

    const result = await inventoryRepository.update(
      id,
      Number(existing.quantity),
      input
    );
    if (!result) {
      throw new NotFoundException("Phiếu nhập");
    }

    return result;
  },

  async delete(id: string): Promise<void> {
    const existing = await inventoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Phiếu nhập");
    }

    await inventoryRepository.delete(
      id,
      Number(existing.quantity),
      existing.ingredient.id
    );
  },

  async getStats(from?: Date, to?: Date) {
    return inventoryRepository.getStats(from, to);
  },
};
