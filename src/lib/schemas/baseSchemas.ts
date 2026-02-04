import { z } from "zod";

export const idSchema = z.object({
  id: z.string(),
});

export const paginationSchema = z.object({
  skip: z.number().min(0).default(0),
  limit: z.number().min(1).max(100).default(20),
});

export type IdInput = z.infer<typeof idSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
