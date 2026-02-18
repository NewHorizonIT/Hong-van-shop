import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { reportService, reportQuerySchema } from "@/modules/report";
import { apiSuccess, ApiErrors, withAuth } from "@/modules/common";

/**
 * @swagger
 * /api/reports/profit:
 *   get:
 *     tags:
 *       - Reports
 *     summary: Get profit report
 *     description: Get revenue, costs and gross profit
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
 *     responses:
 *       200:
 *         description: Profit report
 */
export const GET = withAuth(
  async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const query = reportQuerySchema.parse({
        from: searchParams.get("from"),
        to: searchParams.get("to"),
      });

      const result = await reportService.getProfit(query);
      return apiSuccess(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((e) => e.message).join(", ");
        return ApiErrors.VALIDATION_ERROR(message);
      }

      console.error("Get profit report error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
  { roles: ["ADMIN"] },
);
