import { NextRequest } from "next/server";
import { ZodError } from "zod";
import {
  inventoryService,
  createInventoryImportSchema,
  inventoryImportQuerySchema,
} from "@/modules/inventory";
import {
  apiSuccess,
  apiError,
  ApiErrors,
  withAuth,
  AuthRequest,
} from "@/modules/common";
import { ApiException } from "@/modules/common/api-error";

/**
 * @swagger
 * /api/inventory-imports:
 *   get:
 *     tags:
 *       - Inventory
 *     summary: Get all inventory imports
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
 *         name: productVariantId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: List of inventory imports
 *       401:
 *         description: Unauthorized
 */
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = inventoryImportQuerySchema.parse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
      productVariantId: searchParams.get("productVariantId") || undefined,
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
    });

    const result = await inventoryService.findAll(query);
    return apiSuccess(result);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return ApiErrors.VALIDATION_ERROR(message);
    }

    if (error instanceof ApiException) {
      return apiError(error.code, error.message, error.statusCode);
    }

    console.error("Get inventory imports error:", error);
    return ApiErrors.INTERNAL_ERROR();
  }
});

/**
 * @swagger
 * /api/inventory-imports:
 *   post:
 *     tags:
 *       - Inventory
 *     summary: Create inventory import
 *     description: Record a new inventory import and update stock
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
 *               - productVariantId
 *               - quantity
 *               - importPrice
 *             properties:
 *               productVariantId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               importPrice:
 *                 type: number
 *                 minimum: 0
 *               importDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Import created and stock updated
 *       400:
 *         description: Validation error
 */
export const POST = withAuth(
  async (req: AuthRequest) => {
    try {
      const body = await req.json();
      const input = createInventoryImportSchema.parse(body);

      const importRecord = await inventoryService.create(input, req.user.id);
      return apiSuccess(importRecord, 201);
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((e) => e.message).join(", ");
        return ApiErrors.VALIDATION_ERROR(message);
      }

      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Create inventory import error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
  { roles: ["ADMIN"] },
);
