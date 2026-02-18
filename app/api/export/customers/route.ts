import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { exportService, exportQuerySchema } from "@/modules/export";
import { ApiErrors, withAuth } from "@/modules/common";

/**
 * @swagger
 * /api/export/customers:
 *   get:
 *     tags:
 *       - Export
 *     summary: Export customers to Excel
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
 *         description: Excel file download
 */
export const GET = withAuth(
  async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const query = exportQuerySchema.parse({
        from: searchParams.get("from"),
        to: searchParams.get("to"),
      });

      const buffer = await exportService.exportCustomers(query.from, query.to);
      const filename = `customers_${query.from.toISOString().split("T")[0]}_${query.to.toISOString().split("T")[0]}.xlsx`;

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((e) => e.message).join(", ");
        return ApiErrors.VALIDATION_ERROR(message);
      }

      console.error("Export customers error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
  { roles: ["ADMIN"] },
);
