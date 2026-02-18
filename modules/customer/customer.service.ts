import { customerRepository } from "./customer.repository";
import {
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerQueryInput,
} from "./customer.schema";
import { CustomerListResponse, CustomerResponse } from "./customer.types";
import {
  NotFoundException,
  ValidationException,
} from "@/modules/common/api-error";

export const customerService = {
  async findAll(query: CustomerQueryInput): Promise<CustomerListResponse> {
    const { page, limit, search } = query;

    const { customers, total } = await customerRepository.findAll(
      { search },
      page,
      limit,
    );

    return {
      customers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string): Promise<CustomerResponse> {
    const customer = await customerRepository.findById(id);

    if (!customer) {
      throw new NotFoundException("Customer");
    }

    return customer;
  },

  async create(input: CreateCustomerInput): Promise<CustomerResponse> {
    // Check if phone already exists
    const existing = await customerRepository.findByPhone(input.phone);
    if (existing) {
      throw new ValidationException("Phone number already exists");
    }

    return customerRepository.create(input);
  },

  async update(
    id: string,
    input: UpdateCustomerInput,
  ): Promise<CustomerResponse> {
    const existing = await customerRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Customer");
    }

    // Check if phone is being changed and already exists
    if (input.phone && input.phone !== existing.phone) {
      const phoneExists = await customerRepository.findByPhone(input.phone);
      if (phoneExists) {
        throw new ValidationException("Phone number already exists");
      }
    }

    return customerRepository.update(id, input);
  },

  async delete(id: string): Promise<void> {
    const existing = await customerRepository.findById(id);
    if (!existing) {
      throw new NotFoundException("Customer");
    }

    // Check if customer has orders
    const hasOrders = await customerRepository.hasOrders(id);
    if (hasOrders) {
      throw new ValidationException(
        "Cannot delete customer with existing orders",
      );
    }

    await customerRepository.delete(id);
  },
};
