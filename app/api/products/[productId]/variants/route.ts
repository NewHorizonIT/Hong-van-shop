import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { productService, createVariantSchema } from "@/modules/product";
import { apiSuccess, apiError, ApiErrors, withAuth } from "@/modules/common";
import { ApiException } from "@/modules/common/api-error";

/**
 * @swagger
 * /api/products/{productId}/variants:
 *   post:
 *     tags:
 *       - Products
 *     summary: Add variant to product
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - costPrice
 *               - sellingPrice
 *             properties:
 *               name:
 *                 type: string
 *                 example: Size L
 *               unit:
 *                 type: string
 *                 example: con
 *               costPrice:
 *                 type: number
 *                 example: 60000
 *               sellingPrice:
 *                 type: number
 *                 example: 100000
 *               stockQuantity:
 *                 type: integer
 *                 example: 50
 *     responses:
 *       201:
 *         description: Variant created
 *       400:
 *         description: Validation error
 *       404:
 *         description: Product not found
 */
export const POST = withAuth(
  async (
    req: NextRequest,
    context: { params: Promise<{ productId: string }> },
  ) => {
    try {
      const { productId } = await context.params;
      const body = await req.json();
      const input = createVariantSchema.parse(body);

      const variant = await productService.createVariant(productId, input);
      return apiSuccess(variant, 201);
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((e) => e.message).join(", ");
        return ApiErrors.VALIDATION_ERROR(message);
      }

      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Create variant error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
  { roles: ["ADMIN"] },
);
