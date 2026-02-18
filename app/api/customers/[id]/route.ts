import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { customerService, updateCustomerSchema } from "@/modules/customer";
import { apiSuccess, apiError, ApiErrors, withAuth } from "@/modules/common";
import { ApiException } from "@/modules/common/api-error";

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     tags:
 *       - Customers
 *     summary: Get customer by ID
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
 *         description: Customer details
 *       404:
 *         description: Customer not found
 */
export const GET = withAuth(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context.params;
      const customer = await customerService.findById(id);
      return apiSuccess(customer);
    } catch (error) {
      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Get customer error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
);

/**
 * @swagger
 * /api/customers/{id}:
 *   patch:
 *     tags:
 *       - Customers
 *     summary: Update customer
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
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer updated
 *       404:
 *         description: Customer not found
 */
export const PATCH = withAuth(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context.params;
      const body = await req.json();
      const input = updateCustomerSchema.parse(body);

      const customer = await customerService.update(id, input);
      return apiSuccess(customer);
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((e) => e.message).join(", ");
        return ApiErrors.VALIDATION_ERROR(message);
      }

      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Update customer error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
);

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     tags:
 *       - Customers
 *     summary: Delete customer
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
 *         description: Customer deleted
 *       400:
 *         description: Cannot delete - has orders
 *       404:
 *         description: Customer not found
 */
export const DELETE = withAuth(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context.params;
      await customerService.delete(id);
      return apiSuccess({ message: "Customer deleted successfully" });
    } catch (error) {
      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Delete customer error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
  { roles: ["ADMIN"] },
);
