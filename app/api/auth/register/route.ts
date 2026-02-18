import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { authService, registerSchema } from "@/modules/auth";
import { apiSuccess, apiError, ApiErrors } from "@/modules/common";
import { ApiException } from "@/modules/common/api-error";

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register new user
 *     description: Create a new user account with STAFF role
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
 *               - confirmPassword
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyen Van A
 *               email:
 *                 type: string
 *                 format: email
 *                 example: staff@hongvan.shop
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *               confirmPassword:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: JWT token in httpOnly cookie
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const input = registerSchema.parse(body);

    // Register user
    const result = await authService.register(input);

    // Set token in httpOnly cookie
    const response = apiSuccess(result, 201);
    response.cookies.set("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return ApiErrors.VALIDATION_ERROR(message);
    }

    if (error instanceof ApiException) {
      return apiError(error.code, error.message, error.statusCode);
    }

    console.error("Register error:", error);
    return ApiErrors.INTERNAL_ERROR();
  }
}
