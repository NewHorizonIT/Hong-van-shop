import bcrypt from "bcrypt";
import { userRepository } from "./user.repository";
import {
  CreateUserInput,
  UpdateUserInput,
  UserQueryInput,
} from "./user.schema";
import { UserListResponse, UserResponse } from "./user.types";
import {
  NotFoundException,
  ValidationException,
} from "@/modules/common/api-error";

const SALT_ROUNDS = 10;

export const userService = {
  async findAll(query: UserQueryInput): Promise<UserListResponse> {
    const { page, limit, search, role, isActive } = query;

    const { users, total } = await userRepository.findAll(
      { search, role, isActive },
      page,
      limit,
    );

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string): Promise<UserResponse> {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new NotFoundException("User");
    }

    return user;
  },

  async create(input: CreateUserInput): Promise<UserResponse> {
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ValidationException("Email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    // Create user
    return userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role || "STAFF",
    });
  },

  async update(id: string, input: UpdateUserInput): Promise<UserResponse> {
    // Check if user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException("User");
    }

    // Check if email is being changed and already exists
    if (input.email && input.email !== existingUser.email) {
      const emailExists = await userRepository.findByEmail(input.email);
      if (emailExists) {
        throw new ValidationException("Email already exists");
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (input.name) updateData.name = input.name;
    if (input.email) updateData.email = input.email;
    if (input.role) updateData.role = input.role;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    // Hash password if provided
    if (input.password) {
      updateData.passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    }

    return userRepository.update(id, updateData);
  },

  async delete(id: string): Promise<void> {
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException("User");
    }

    await userRepository.delete(id);
  },
};
