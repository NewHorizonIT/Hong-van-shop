import { categoryRepository } from "./category.repository";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryQueryInput,
} from "./category.schema";
import { CategoryListResponse, CategoryResponse } from "./category.types";
import {
  NotFoundException,
  ValidationException,
} from "@/modules/common/api-error";

export const categoryService = {
  async findAll(query: CategoryQueryInput): Promise<CategoryListResponse> {
    const { page, limit, search, isActive } = query;

    const { categories, total } = await categoryRepository.findAll(
      { search, isActive },
      page,
      limit,
    );

    return {
      categories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string): Promise<CategoryResponse> {
    const category = await categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException("Category");
    }

    return category;
  },

  async create(input: CreateCategoryInput): Promise<CategoryResponse> {
    // Check if name already exists
    const existing = await categoryRepository.findByName(input.name);
    if (existing) {
      throw new ValidationException("Category name already exists");
    }

    return categoryRepository.create({ name: input.name });
  },

  async update(
    id: string,
    input: UpdateCategoryInput,
  ): Promise<CategoryResponse> {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Category");
    }

    // Check if name is being changed and already exists
    if (input.name && input.name !== existing.name) {
      const nameExists = await categoryRepository.findByName(input.name);
      if (nameExists) {
        throw new ValidationException("Category name already exists");
      }
    }

    return categoryRepository.update(id, input);
  },

  async delete(id: string): Promise<void> {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Category");
    }

    // Check if category has products
    const hasProducts = await categoryRepository.hasProducts(id);
    if (hasProducts) {
      throw new ValidationException(
        "Cannot delete category with existing products. Deactivate it instead.",
      );
    }

    await categoryRepository.delete(id);
  },
};
