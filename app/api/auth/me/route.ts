import { authService } from "@/modules/auth";
import { apiSuccess, ApiErrors, withAuth, AuthRequest } from "@/modules/common";

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get current user
 *     description: Get authenticated user information
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const GET = withAuth(async (req: AuthRequest) => {
  const user = await authService.getCurrentUser(req.user.id);

  if (!user) {
    return ApiErrors.UNAUTHORIZED();
  }

  return apiSuccess(user);
});
