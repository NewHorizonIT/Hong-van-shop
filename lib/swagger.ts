import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: "app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Hong Van Shop API",
        version: "1.0.0",
        description:
          "API documentation for Hong Van Shop - Food ordering management system",
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
          description: "Development server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "token",
          },
        },
        schemas: {
          ApiResponse: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object" },
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
          LoginRequest: {
            type: "object",
            required: ["email", "password"],
            properties: {
              email: {
                type: "string",
                format: "email",
                example: "admin@hongvan.shop",
              },
              password: {
                type: "string",
                minLength: 6,
                example: "password123",
              },
            },
          },
          LoginResponse: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  user: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      email: { type: "string" },
                      name: { type: "string" },
                      role: { type: "string", enum: ["ADMIN", "STAFF"] },
                    },
                  },
                  token: { type: "string" },
                },
              },
            },
          },
          User: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              email: { type: "string", format: "email" },
              name: { type: "string" },
              role: { type: "string", enum: ["ADMIN", "STAFF"] },
              isActive: { type: "boolean" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
          Error: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
      },
      tags: [
        { name: "Auth", description: "Authentication endpoints" },
        { name: "Users", description: "User management" },
        { name: "Categories", description: "Product categories" },
        { name: "Products", description: "Product management" },
        { name: "Orders", description: "Order management" },
        { name: "Reports", description: "Analytics and reports" },
        { name: "Export", description: "Export data to Excel" },
      ],
    },
  });
  return spec;
};
