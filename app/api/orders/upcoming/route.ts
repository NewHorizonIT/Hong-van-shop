import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { orderService, upcomingOrdersSchema } from "@/modules/order";
import { apiSuccess, apiError, ApiErrors, withAuth } from "@/modules/common";
import { ApiException } from "@/modules/common/api-error";

/**
 * @swagger
 * /api/orders/upcoming:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get upcoming orders
 *     description: Get orders with delivery time within the next N hours
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 2
 *           minimum: 1
 *           maximum: 72
 *         description: Number of hours to look ahead
 *     responses:
 *       200:
 *         description: List of upcoming orders
 *       401:
 *         description: Unauthorized
 */
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = upcomingOrdersSchema.parse({
      hours: searchParams.get("hours") || 2,
    });

    const orders = await orderService.findUpcoming(query);
    return apiSuccess({ orders, count: orders.length });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return ApiErrors.VALIDATION_ERROR(message);
    }

    if (error instanceof ApiException) {
      return apiError(error.code, error.message, error.statusCode);
    }

    console.error("Get upcoming orders error:", error);
    return ApiErrors.INTERNAL_ERROR();
  }
});
