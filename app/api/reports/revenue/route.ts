import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { reportService, reportQuerySchema } from "@/modules/report";
import { apiSuccess, ApiErrors, withAuth } from "@/modules/common";

/**
 * @swagger
 * /api/reports/revenue:
 *   get:
 *     tags:
 *       - Reports
 *     summary: Get revenue report
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
 *         description: Revenue report
 *       400:
 *         description: Invalid date range
 */
export const GET = withAuth(
  async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const query = reportQuerySchema.parse({
        from: searchParams.get("from"),
        to: searchParams.get("to"),
      });

      const result = await reportService.getRevenue(query);
      return apiSuccess(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((e) => e.message).join(", ");
        return ApiErrors.VALIDATION_ERROR(message);
      }

      console.error("Get revenue report error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
  { roles: ["ADMIN"] },
);
