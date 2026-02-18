import { Role } from "@/lib/generated/prisma";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: Role;
  name: string;
  iat?: number;
  exp?: number;
}
