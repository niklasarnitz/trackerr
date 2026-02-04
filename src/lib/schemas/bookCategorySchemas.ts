import { z } from "zod";

export const bookCategoryCreateSchema = z.object({
  name: z.string().min(1).max(50),
});

export const bookCategoryUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
});

export type BookCategoryCreateInput = z.infer<typeof bookCategoryCreateSchema>;
export type BookCategoryUpdateInput = z.infer<typeof bookCategoryUpdateSchema>;
