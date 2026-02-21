import { NextRequest } from "next/server";
import { ZodError } from "zod";
import {
  ingredientService,
  createIngredientSchema,
  ingredientQuerySchema,
} from "@/modules/ingredient";
import { apiSuccess, apiError, ApiErrors, withAuth } from "@/modules/common";
import { ApiException } from "@/modules/common/api-error";

/**
 * @swagger
 * /api/ingredients:
 *   get:
 *     tags:
 *       - Ingredients
 *     summary: Get all ingredients
 *     description: Get paginated list of ingredients
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of ingredients
 *       401:
 *         description: Unauthorized
 */
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = ingredientQuerySchema.parse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
      search: searchParams.get("search") || undefined,
      isActive: searchParams.get("isActive") || undefined,
    });

    const result = await ingredientService.findAll(query);
    return apiSuccess(result);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return ApiErrors.VALIDATION_ERROR(message);
    }

    if (error instanceof ApiException) {
      return apiError(error.code, error.message, error.statusCode);
    }

    console.error("Get ingredients error:", error);
    return ApiErrors.INTERNAL_ERROR();
  }
});

/**
 * @swagger
 * /api/ingredients:
 *   post:
 *     tags:
 *       - Ingredients
 *     summary: Create ingredient
 *     description: Create a new ingredient (Admin only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Gà nguyên con
 *               unit:
 *                 type: string
 *                 example: kg
 *     responses:
 *       201:
 *         description: Ingredient created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
export const POST = withAuth(
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const input = createIngredientSchema.parse(body);

      const ingredient = await ingredientService.create(input);
      return apiSuccess(ingredient, 201);
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((e) => e.message).join(", ");
        return ApiErrors.VALIDATION_ERROR(message);
      }

      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Create ingredient error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
  { roles: ["ADMIN"] }
);
