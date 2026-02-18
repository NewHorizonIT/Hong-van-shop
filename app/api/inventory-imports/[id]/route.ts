import { NextRequest } from "next/server";
import { ZodError } from "zod";
import {
  inventoryService,
  updateInventoryImportSchema,
} from "@/modules/inventory";
import { apiSuccess, apiError, ApiErrors, withAuth } from "@/modules/common";
import { ApiException } from "@/modules/common/api-error";

/**
 * @swagger
 * /api/inventory-imports/{id}:
 *   get:
 *     tags:
 *       - Inventory
 *     summary: Get inventory import by ID
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
 *         description: Import details
 *       404:
 *         description: Import not found
 */
export const GET = withAuth(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context.params;
      const importRecord = await inventoryService.findById(id);
      return apiSuccess(importRecord);
    } catch (error) {
      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Get inventory import error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
);

/**
 * @swagger
 * /api/inventory-imports/{id}:
 *   patch:
 *     tags:
 *       - Inventory
 *     summary: Update inventory import
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
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               importPrice:
 *                 type: number
 *               importDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Import updated
 *       404:
 *         description: Import not found
 */
export const PATCH = withAuth(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context.params;
      const body = await req.json();
      const input = updateInventoryImportSchema.parse(body);

      const importRecord = await inventoryService.update(id, input);
      return apiSuccess(importRecord);
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((e) => e.message).join(", ");
        return ApiErrors.VALIDATION_ERROR(message);
      }

      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Update inventory import error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
  { roles: ["ADMIN"] },
);

/**
 * @swagger
 * /api/inventory-imports/{id}:
 *   delete:
 *     tags:
 *       - Inventory
 *     summary: Delete inventory import
 *     description: Delete import and decrease stock quantity
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
 *         description: Import deleted
 *       404:
 *         description: Import not found
 */
export const DELETE = withAuth(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context.params;
      await inventoryService.delete(id);
      return apiSuccess({ message: "Inventory import deleted successfully" });
    } catch (error) {
      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Delete inventory import error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
  { roles: ["ADMIN"] },
);
