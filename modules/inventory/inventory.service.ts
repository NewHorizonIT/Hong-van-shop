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
    query: InventoryImportQueryInput,
  ): Promise<InventoryImportListResponse> {
    const { page, limit, productVariantId, from, to } = query;

    const { imports, total } = await inventoryRepository.findAll(
      { productVariantId, from, to },
      page,
      limit,
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
      throw new NotFoundException("Inventory import");
    }

    return importRecord;
  },

  async create(
    input: CreateInventoryImportInput,
    createdById: string,
  ): Promise<InventoryImportResponse> {
    // Validate variant exists
    const variant = await inventoryRepository.getVariant(
      input.productVariantId,
    );
    if (!variant) {
      throw new ValidationException("Product variant not found");
    }

    return inventoryRepository.create({
      productVariantId: input.productVariantId,
      quantity: input.quantity,
      importPrice: input.importPrice,
      importDate: input.importDate || new Date(),
      createdById,
    });
  },

  async update(
    id: string,
    input: UpdateInventoryImportInput,
  ): Promise<InventoryImportResponse> {
    const existing = await inventoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Inventory import");
    }

    const result = await inventoryRepository.update(
      id,
      existing.quantity,
      input,
    );
    if (!result) {
      throw new NotFoundException("Inventory import");
    }

    return result;
  },

  async delete(id: string): Promise<void> {
    const existing = await inventoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Inventory import");
    }

    await inventoryRepository.delete(
      id,
      existing.quantity,
      existing.productVariant.id,
    );
  },
};
