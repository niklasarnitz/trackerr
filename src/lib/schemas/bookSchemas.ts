import { z } from "zod";
import { readingProgressStatusSchema } from "./readingProgressSchemas";

export const bookAuthorSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional(),
});

export const bookCreateSchema = z.object({
  isbn: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  authors: z.array(bookAuthorSchema).optional(),
  publisher: z.string().optional(),
  publishedYear: z.number().int().optional(),
  pages: z.number().int().nonnegative().optional(),
  coverUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  abstract: z.string().optional(),
  seriesName: z.string().optional(),
  seriesNumber: z.number().optional(),
  seriesId: z.string().optional(),
  isEbook: z.boolean().default(false),
  isOnWishlist: z.boolean().default(false),
  categoryId: z.string().optional(),
  notes: z.string().optional(),
});

export const bookUpdateSchema = z.object({
  id: z.string(),
  isbn: z.string().optional(),
  title: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  authors: z.array(bookAuthorSchema).optional(),
  publisher: z.string().optional(),
  publishedYear: z.number().int().optional(),
  pages: z.number().int().positive().optional(),
  coverUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  abstract: z.string().optional(),
  seriesName: z.string().optional(),
  seriesNumber: z.number().optional(),
  seriesId: z.string().optional(),
  isEbook: z.boolean().optional(),
  isOnWishlist: z.boolean().optional(),
  categoryId: z.string().optional(),
  status: readingProgressStatusSchema.optional(),
  notes: z.string().optional(),
});

export const bookSearchSchema = z.object({
  search: z.string().optional(),
  status: readingProgressStatusSchema.optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  isOnWishlist: z.boolean().optional(),
  sort: z.enum(["title", "created", "updated", "author"]).default("title"),
  skip: z.number().min(0).default(0),
  limit: z.number().min(1).max(100).default(20),
});

export const bookIdSchema = z.object({
  bookId: z.string(),
});

export const bookTagSchema = z.object({
  bookId: z.string(),
  tagId: z.string(),
});

export type BookAuthorInput = z.infer<typeof bookAuthorSchema>;
export type BookCreateInput = z.infer<typeof bookCreateSchema>;
export type BookUpdateInput = z.infer<typeof bookUpdateSchema>;
export type BookSearchInput = z.infer<typeof bookSearchSchema>;
export type BookIdInput = z.infer<typeof bookIdSchema>;
export type BookTagInput = z.infer<typeof bookTagSchema>;
