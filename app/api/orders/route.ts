import { NextRequest } from "next/server";
import { ZodError } from "zod";
import {
  orderService,
  createOrderSchema,
  orderQuerySchema,
} from "@/modules/order";
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
 * /api/orders:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get all orders
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by customer name, phone, address
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, DONE, CANCELLED]
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter orders from this date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter orders to this date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, deliveryTime, totalAmount, customerName]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Unauthorized
 */
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = orderQuerySchema.parse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: searchParams.get("sortOrder") || undefined,
    });

    const result = await orderService.findAll(query);
    return apiSuccess(result);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return ApiErrors.VALIDATION_ERROR(message);
    }

    if (error instanceof ApiException) {
      return apiError(error.code, error.message, error.statusCode);
    }

    console.error("Get orders error:", error);
    return ApiErrors.INTERNAL_ERROR();
  }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Create order
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
 *               - customerName
 *               - phone
 *               - address
 *               - deliveryTime
 *               - items
 *             properties:
 *               customerName:
 *                 type: string
 *                 example: Nguyen Van A
 *               phone:
 *                 type: string
 *                 example: "0901234567"
 *               address:
 *                 type: string
 *                 example: 123 Nguyen Hue, Q1, HCM
 *               deliveryTime:
 *                 type: string
 *                 format: date-time
 *               note:
 *                 type: string
 *               discount:
 *                 type: number
 *                 default: 0
 *               customerId:
 *                 type: string
 *                 format: uuid
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productVariantId
 *                     - quantity
 *                   properties:
 *                     productVariantId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *     responses:
 *       201:
 *         description: Order created
 *       400:
 *         description: Validation error
 */
export const POST = withAuth(async (req: AuthRequest) => {
  try {
    const body = await req.json();
    const input = createOrderSchema.parse(body);

    const order = await orderService.create(input, req.user.id);
    return apiSuccess(order, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return ApiErrors.VALIDATION_ERROR(message);
    }

    if (error instanceof ApiException) {
      return apiError(error.code, error.message, error.statusCode);
    }

    console.error("Create order error:", error);
    return ApiErrors.INTERNAL_ERROR();
  }
});
