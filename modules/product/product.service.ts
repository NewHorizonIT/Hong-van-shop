import { productRepository } from "./product.repository";
import {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
  CreateVariantInput,
  UpdateVariantInput,
} from "./product.schema";
import {
  ProductListResponse,
  ProductResponse,
  ProductVariantResponse,
} from "./product.types";
import {
  NotFoundException,
  ValidationException,
} from "@/modules/common/api-error";
import { categoryRepository } from "@/modules/category/category.repository";

export const productService = {
  async findAll(query: ProductQueryInput): Promise<ProductListResponse> {
    const { page, limit, search, categoryId, isActive } = query;

    const { products, total } = await productRepository.findAll(
      { search, categoryId, isActive },
      page,
      limit,
    );

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string): Promise<ProductResponse> {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new NotFoundException("Product");
    }

    return product;
  },

  async create(input: CreateProductInput): Promise<ProductResponse> {
    // Check if category exists
    const category = await categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new ValidationException("Category not found");
    }

    return productRepository.create({
      name: input.name,
      description: input.description,
      categoryId: input.categoryId,
      variants: input.variants,
    });
  },

  async update(
    id: string,
    input: UpdateProductInput,
  ): Promise<ProductResponse> {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Product");
    }

    // Check if category exists if being changed
    if (input.categoryId && input.categoryId !== existing.categoryId) {
      const category = await categoryRepository.findById(input.categoryId);
      if (!category) {
        throw new ValidationException("Category not found");
      }
    }

    return productRepository.update(id, input);
  },

  async delete(id: string): Promise<void> {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Product");
    }

    // Soft delete - just deactivate the product
    await productRepository.update(id, { isActive: false });
  },

  // Variant operations
  async createVariant(
    productId: string,
    input: CreateVariantInput,
  ): Promise<ProductVariantResponse> {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException("Product");
    }

    return productRepository.createVariant(productId, input);
  },

  async updateVariant(
    variantId: string,
    input: UpdateVariantInput,
  ): Promise<ProductVariantResponse> {
    const variant = await productRepository.findVariantById(variantId);
    if (!variant) {
      throw new NotFoundException("Product variant");
    }

    return productRepository.updateVariant(variantId, input);
  },

  async deleteVariant(variantId: string): Promise<void> {
    const variant = await productRepository.findVariantById(variantId);
    if (!variant) {
      throw new NotFoundException("Product variant");
    }

    // Check if variant has orders
    const hasOrders = await productRepository.hasVariantOrders(variantId);
    if (hasOrders) {
      throw new ValidationException(
        "Cannot delete variant with existing orders. Deactivate it instead.",
      );
    }

    await productRepository.deleteVariant(variantId);
  },
};
