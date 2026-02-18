import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { productService, updateVariantSchema } from "@/modules/product";
import { apiSuccess, apiError, ApiErrors, withAuth } from "@/modules/common";
import { ApiException } from "@/modules/common/api-error";

/**
 * @swagger
 * /api/products/{productId}/variants/{id}:
 *   patch:
 *     tags:
 *       - Products
 *     summary: Update variant
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
 *       - in: path
 *         name: id
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
 *               unit:
 *                 type: string
 *               costPrice:
 *                 type: number
 *               sellingPrice:
 *                 type: number
 *               stockQuantity:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Variant updated
 *       404:
 *         description: Variant not found
 */
export const PATCH = withAuth(
  async (
    req: NextRequest,
    context: { params: Promise<{ productId: string; id: string }> },
  ) => {
    try {
      const { id } = await context.params;
      const body = await req.json();
      const input = updateVariantSchema.parse(body);

      const variant = await productService.updateVariant(id, input);
      return apiSuccess(variant);
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((e) => e.message).join(", ");
        return ApiErrors.VALIDATION_ERROR(message);
      }

      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Update variant error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
  { roles: ["ADMIN"] },
);

/**
 * @swagger
 * /api/products/{productId}/variants/{id}:
 *   delete:
 *     tags:
 *       - Products
 *     summary: Delete variant
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
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Variant deleted
 *       400:
 *         description: Cannot delete - has orders
 *       404:
 *         description: Variant not found
 */
export const DELETE = withAuth(
  async (
    req: NextRequest,
    context: { params: Promise<{ productId: string; id: string }> },
  ) => {
    try {
      const { id } = await context.params;
      await productService.deleteVariant(id);
      return apiSuccess({ message: "Variant deleted successfully" });
    } catch (error) {
      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Delete variant error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
  { roles: ["ADMIN"] },
);
