import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { userService, createUserSchema, userQuerySchema } from "@/modules/user";
import { apiSuccess, apiError, ApiErrors, withAuth } from "@/modules/common";
import { ApiException } from "@/modules/common/api-error";

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     description: Get paginated list of users (Admin only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, STAFF]
 *         description: Filter by role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
export const GET = withAuth(
  async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const query = userQuerySchema.parse({
        page: searchParams.get("page") || 1,
        limit: searchParams.get("limit") || 10,
        search: searchParams.get("search") || undefined,
        role: searchParams.get("role") || undefined,
        isActive: searchParams.get("isActive") || undefined,
      });

      const result = await userService.findAll(query);
      return apiSuccess(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((e) => e.message).join(", ");
        return ApiErrors.VALIDATION_ERROR(message);
      }

      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Get users error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
  { roles: ["ADMIN"] },
);

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags:
 *       - Users
 *     summary: Create new user
 *     description: Create a new user account (Admin only)
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
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyen Van B
 *               email:
 *                 type: string
 *                 format: email
 *                 example: staff2@hongvan.shop
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [ADMIN, STAFF]
 *                 default: STAFF
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
export const POST = withAuth(
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const input = createUserSchema.parse(body);

      const user = await userService.create(input);
      return apiSuccess(user, 201);
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((e) => e.message).join(", ");
        return ApiErrors.VALIDATION_ERROR(message);
      }

      if (error instanceof ApiException) {
        return apiError(error.code, error.message, error.statusCode);
      }

      console.error("Create user error:", error);
      return ApiErrors.INTERNAL_ERROR();
    }
  },
  { roles: ["ADMIN"] },
);
