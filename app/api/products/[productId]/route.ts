import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { productService, updateProductSchema } from "@/modules/product";
import { apiSuccess, apiError, ApiErrors, withAuth } from "@/modules/common";
import { ApiException } from "@/modules/common/api-error";

/**
 * @swagger
 * /api/products/{productId}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get product by ID
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product details with variants
 *       404:
 *         description: Product not found
 */
export const GET = withAuth(
  async (
    req: NextRequest,
    context?: { params: Promise<Record<string, string>> },
  ) => {
    if (!context) {
      return ApiErrors.INTERNAL_ERROR();
    }
    try {
      const { productId } = await context.params;
      const product = await productService.findById(productId);
      return apiSuccess(product);
    } catch (error) {
      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Get product error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
);

/**
 * @swagger
 * /api/products/{productId}:
 *   patch:
 *     tags:
 *       - Products
 *     summary: Update product
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 */
export const PATCH = withAuth(
  async (
    req: NextRequest,
    context?: { params: Promise<Record<string, string>> },
  ) => {
    if (!context) {
      return ApiErrors.INTERNAL_ERROR();
    }
    try {
      const { productId } = await context.params;
      const body = await req.json();
      const input = updateProductSchema.parse(body);

      const product = await productService.update(productId, input);
      return apiSuccess(product);
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((e) => e.message).join(", ");
        return ApiErrors.VALIDATION_ERROR(message);
      }

      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Update product error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
  { roles: ["ADMIN"] },
);

/**
 * @swagger
 * /api/products/{productId}:
 *   delete:
 *     tags:
 *       - Products
 *     summary: Delete product
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product deleted
 *       400:
 *         description: Cannot delete - has orders
 *       404:
 *         description: Product not found
 */
export const DELETE = withAuth(
  async (
    req: NextRequest,
    context?: { params: Promise<Record<string, string>> },
  ) => {
    if (!context) {
      return ApiErrors.INTERNAL_ERROR();
    }
    try {
      const { productId } = await context.params;
      await productService.delete(productId);
      return apiSuccess({ message: "Product deleted successfully" });
    } catch (error) {
      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Delete product error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
  { roles: ["ADMIN"] },
);
