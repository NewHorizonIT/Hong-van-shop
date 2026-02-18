import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { orderService, updateOrderSchema } from "@/modules/order";
import { apiSuccess, apiError, ApiErrors, withAuth } from "@/modules/common";
import { ApiException } from "@/modules/common/api-error";

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get order by ID
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
 *         description: Order details
 *       404:
 *         description: Order not found
 */
export const GET = withAuth(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context.params;
      const order = await orderService.findById(id);
      return apiSuccess(order);
    } catch (error) {
      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Get order error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
);

/**
 * @swagger
 * /api/orders/{id}:
 *   patch:
 *     tags:
 *       - Orders
 *     summary: Update order
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
 *               customerName:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               deliveryTime:
 *                 type: string
 *                 format: date-time
 *               note:
 *                 type: string
 *               discount:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, DONE, CANCELLED]
 *     responses:
 *       200:
 *         description: Order updated
 *       404:
 *         description: Order not found
 */
export const PATCH = withAuth(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context.params;
      const body = await req.json();
      const input = updateOrderSchema.parse(body);

      const order = await orderService.update(id, input);
      return apiSuccess(order);
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((e) => e.message).join(", ");
        return ApiErrors.VALIDATION_ERROR(message);
      }

      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Update order error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
);

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     tags:
 *       - Orders
 *     summary: Delete order
 *     description: Only pending orders can be deleted
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
 *         description: Order deleted
 *       400:
 *         description: Cannot delete non-pending order
 *       404:
 *         description: Order not found
 */
export const DELETE = withAuth(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context.params;
      await orderService.delete(id);
      return apiSuccess({ message: "Order deleted successfully" });
    } catch (error) {
      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Delete order error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
  { roles: ["ADMIN"] },
);
