import { NextResponse } from "next/server";
import { exportService } from "@/modules/export";
import { ApiErrors, withAuth } from "@/modules/common";

/**
 * @swagger
 * /api/export/products:
 *   get:
 *     tags:
 *       - Export
 *     summary: Export all products to Excel
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Excel file download
 */
export const GET = withAuth(
  async () => {
    try {
      const buffer = await exportService.exportProducts();
      const filename = `products_${new Date().toISOString().split("T")[0]}.xlsx`;

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } catch (error) {
      console.error("Export products error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
  { roles: ["ADMIN"] },
);
