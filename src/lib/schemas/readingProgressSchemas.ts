import { BookStatus } from "@prisma/client";
import { z } from "zod";

export const readingProgressStatusSchema = z.enum(BookStatus);

export const readingProgressCreateSchema = z.object({
  bookId: z.string(),
  pagesRead: z.number().int().min(0),
});

export const readingProgressGetByBookSchema = z.object({
  bookId: z.string(),
});

export type ReadingProgressStatusInput = z.infer<
  typeof readingProgressStatusSchema
>;
export type ReadingProgressCreateInput = z.infer<
  typeof readingProgressCreateSchema
>;
export type ReadingProgressGetByBookInput = z.infer<
  typeof readingProgressGetByBookSchema
>;
