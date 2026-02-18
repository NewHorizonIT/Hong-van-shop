import bcrypt from "bcrypt";
import { signToken } from "@/lib/auth";
import { authRepository } from "./auth.repository";
import { LoginInput, RegisterInput, ChangePasswordInput } from "./auth.schema";
import { LoginResponse, AuthUser } from "./auth.types";
import {
  InvalidCredentialsException,
  ForbiddenException,
  NotFoundException,
  ValidationException,
} from "@/modules/common/api-error";

const SALT_ROUNDS = 10;

export const authService = {
  async login(input: LoginInput): Promise<LoginResponse> {
    const user = await authRepository.findUserByEmail(input.email);

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    if (!user.isActive) {
      throw new ForbiddenException("User account is inactive");
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = signToken(authUser);

    return {
      user: authUser,
      token,
    };
  },

  async changePassword(
    userId: string,
    input: ChangePasswordInput,
  ): Promise<void> {
    const user = await authRepository.findUserByEmail(userId);

    if (!user) {
      throw new NotFoundException("User");
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      input.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const newPasswordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
    await authRepository.updatePassword(userId, newPasswordHash);
  },

  async getCurrentUser(userId: string): Promise<AuthUser | null> {
    const user = await authRepository.findUserById(userId);

    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  async register(input: RegisterInput): Promise<LoginResponse> {
    // Check if email already exists
    const emailExists = await authRepository.emailExists(input.email);
    if (emailExists) {
      throw new ValidationException("Email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    // Create user
    const user = await authRepository.createUser({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = signToken(authUser);

    return {
      user: authUser,
      token,
    };
  },
};
