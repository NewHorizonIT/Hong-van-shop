import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { ingredientService, updateIngredientSchema } from "@/modules/ingredient";
import { apiSuccess, apiError, ApiErrors, withAuth } from "@/modules/common";
import { ApiException } from "@/modules/common/api-error";

/**
 * @swagger
 * /api/ingredients/{id}:
 *   get:
 *     tags:
 *       - Ingredients
 *     summary: Get ingredient by ID
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Ingredient details
 *       404:
 *         description: Ingredient not found
 */
export const GET = withAuth(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context.params;
      const ingredient = await ingredientService.findById(id);
      return apiSuccess(ingredient);
    } catch (error) {
      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Get ingredient error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  }
);

/**
 * @swagger
 * /api/ingredients/{id}:
 *   patch:
 *     tags:
 *       - Ingredients
 *     summary: Update ingredient
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
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
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Ingredient updated
 *       404:
 *         description: Ingredient not found
 */
export const PATCH = withAuth(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context.params;
      const body = await req.json();
      const input = updateIngredientSchema.parse(body);

      const ingredient = await ingredientService.update(id, input);
      return apiSuccess(ingredient);
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((e) => e.message).join(", ");
        return ApiErrors.VALIDATION_ERROR(message);
      }

      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Update ingredient error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
  { roles: ["ADMIN"] }
);

/**
 * @swagger
 * /api/ingredients/{id}:
 *   delete:
 *     tags:
 *       - Ingredients
 *     summary: Delete ingredient
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Ingredient deleted
 *       400:
 *         description: Cannot delete - has imports
 *       404:
 *         description: Ingredient not found
 */
export const DELETE = withAuth(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context.params;
      await ingredientService.delete(id);
      return apiSuccess({ message: "Đã xóa nguyên liệu thành công" });
    } catch (error) {
      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Delete ingredient error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
  { roles: ["ADMIN"] }
);
