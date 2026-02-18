import { z } from "zod";

export const reportQuerySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export const topProductsQuerySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  limit: z.coerce.number().int().positive().default(10),
});

export type ReportQueryInput = z.infer<typeof reportQuerySchema>;
export type TopProductsQueryInput = z.infer<typeof topProductsQuerySchema>;
