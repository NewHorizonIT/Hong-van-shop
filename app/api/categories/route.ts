import { NextRequest } from "next/server";
import { ZodError } from "zod";
import {
  categoryService,
  createCategorySchema,
  categoryQuerySchema,
} from "@/modules/category";
import { apiSuccess, apiError, ApiErrors, withAuth } from "@/modules/common";
import { ApiException } from "@/modules/common/api-error";

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get all categories
 *     description: Get paginated list of product categories
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
 *         description: List of categories
 *       401:
 *         description: Unauthorized
 */
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = categoryQuerySchema.parse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
      search: searchParams.get("search") || undefined,
      isActive: searchParams.get("isActive") || undefined,
    });

    const result = await categoryService.findAll(query);
    return apiSuccess(result);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return ApiErrors.VALIDATION_ERROR(message);
    }

    if (error instanceof ApiException) {
      return apiError(error.code, error.message, error.statusCode);
    }

    console.error("Get categories error:", error);
    return ApiErrors.INTERNAL_ERROR();
  }
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags:
 *       - Categories
 *     summary: Create category
 *     description: Create a new product category (Admin only)
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
 *                 example: Gà
 *     responses:
 *       201:
 *         description: Category created
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
      const input = createCategorySchema.parse(body);

      const category = await categoryService.create(input);
      return apiSuccess(category, 201);
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((e) => e.message).join(", ");
        return ApiErrors.VALIDATION_ERROR(message);
      }

      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Create category error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
  { roles: ["ADMIN"] },
);
