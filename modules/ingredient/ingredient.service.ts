import { ingredientRepository } from "./ingredient.repository";
import {
  CreateIngredientInput,
  UpdateIngredientInput,
  IngredientQueryInput,
} from "./ingredient.schema";
import { IngredientListResponse, IngredientResponse } from "./ingredient.types";
import {
  NotFoundException,
  ValidationException,
} from "@/modules/common/api-error";

export const ingredientService = {
  async findAll(query: IngredientQueryInput): Promise<IngredientListResponse> {
    const { page, limit, search, isActive } = query;

    const { ingredients, total } = await ingredientRepository.findAll(
      { search, isActive },
      page,
      limit
    );

    return {
      ingredients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findAllActive() {
    return ingredientRepository.findAllActive();
  },

  async findById(id: string): Promise<IngredientResponse> {
    const ingredient = await ingredientRepository.findById(id);

    if (!ingredient) {
      throw new NotFoundException("Nguyên liệu");
    }

    return ingredient;
  },

  async create(input: CreateIngredientInput): Promise<IngredientResponse> {
    // Check for duplicate name
    const existing = await ingredientRepository.findByName(input.name);
    if (existing) {
      throw new ValidationException("Tên nguyên liệu đã tồn tại");
    }

    return ingredientRepository.create({
      name: input.name,
      unit: input.unit || "kg",
    });
  },

  async update(
    id: string,
    input: UpdateIngredientInput
  ): Promise<IngredientResponse> {
    const existing = await ingredientRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Nguyên liệu");
    }

    // Check for duplicate name if updating name
    if (input.name && input.name !== existing.name) {
      const duplicate = await ingredientRepository.findByName(input.name);
      if (duplicate) {
        throw new ValidationException("Tên nguyên liệu đã tồn tại");
      }
    }

    const result = await ingredientRepository.update(id, input);
    if (!result) {
      throw new NotFoundException("Nguyên liệu");
    }

    return result;
  },

  async delete(id: string): Promise<void> {
    const existing = await ingredientRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Nguyên liệu");
    }

    // Check if has imports
    const hasImports = await ingredientRepository.hasImports(id);
    if (hasImports) {
      throw new ValidationException(
        "Không thể xóa nguyên liệu đã có lịch sử nhập hàng. Vui lòng ẩn thay vì xóa."
      );
    }

    await ingredientRepository.delete(id);
  },
};
