import { z } from "zod";

export const tagCreateSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().optional(),
});

export const tagUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50).optional(),
  color: z.string().optional(),
});

export type TagCreateInput = z.infer<typeof tagCreateSchema>;
export type TagUpdateInput = z.infer<typeof tagUpdateSchema>;
