import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { ApiErrors, apiError } from "./api-response";
import { Role } from "@/lib/generated/prisma";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface AuthRequest extends NextRequest {
  user: AuthUser;
}

type RouteHandler = (
  req: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => Promise<Response>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AuthenticatedHandler<T = Record<string, string>> = (
  req: AuthRequest,
  context: { params: Promise<T> },
) => Promise<Response>;

interface WithAuthOptions {
  roles?: Role[];
}

export function withAuth<T = Record<string, string>>(
  handler: AuthenticatedHandler<T>,
  options: WithAuthOptions = {},
): RouteHandler {
  return async (req, context) => {
    try {
      // Get token from cookie or Authorization header
      const token =
        req.cookies.get("token")?.value ||
        req.headers.get("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return ApiErrors.UNAUTHORIZED();
      }

      // Verify token
      const decoded = verifyToken(token) as AuthUser;

      if (!decoded || !decoded.id) {
        return ApiErrors.UNAUTHORIZED();
      }

      // Check role if specified
      if (options.roles && options.roles.length > 0) {
        if (!options.roles.includes(decoded.role)) {
          return ApiErrors.FORBIDDEN();
        }
      }

      // Attach user to request
      const authReq = req as AuthRequest;
      authReq.user = decoded;

      return handler(authReq, context as { params: Promise<T> });
    } catch {
      return ApiErrors.UNAUTHORIZED();
    }
  };
}
