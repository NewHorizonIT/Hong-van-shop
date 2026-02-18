import { z } from "zod";

export const exportQuerySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export type ExportQueryInput = z.infer<typeof exportQuerySchema>;
