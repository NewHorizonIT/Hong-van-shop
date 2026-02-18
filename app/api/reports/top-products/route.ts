import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { reportService, topProductsQuerySchema } from "@/modules/report";
import { apiSuccess, ApiErrors, withAuth } from "@/modules/common";

/**
 * @swagger
 * /api/reports/top-products:
 *   get:
 *     tags:
 *       - Reports
 *     summary: Get top selling products
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Top products report
 */
export const GET = withAuth(
  async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const query = topProductsQuerySchema.parse({
        from: searchParams.get("from"),
        to: searchParams.get("to"),
        limit: searchParams.get("limit") || 10,
      });

      const result = await reportService.getTopProducts(query);
      return apiSuccess(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((e) => e.message).join(", ");
        return ApiErrors.VALIDATION_ERROR(message);
      }

      console.error("Get top products error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
  { roles: ["ADMIN"] },
);
