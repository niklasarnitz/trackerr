import { z } from "zod";

export const bookSeriesCreateSchema = z.object({
  name: z.string().min(1, "Series name is required"),
});

export const bookSeriesUpdateSchema = bookSeriesCreateSchema.extend({
  id: z.string(),
});

export const bookSeriesSearchSchema = z.object({
  query: z.string().optional(),
  skip: z.number().min(0).default(0),
  limit: z.number().min(1).max(100).default(20),
});

export type BookSeriesCreateInput = z.infer<typeof bookSeriesCreateSchema>;
export type BookSeriesUpdateInput = z.infer<typeof bookSeriesUpdateSchema>;
export type BookSeriesSearchInput = z.infer<typeof bookSeriesSearchSchema>;
