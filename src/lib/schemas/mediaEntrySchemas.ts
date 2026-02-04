import { MediaType } from "@prisma/client";
import { z } from "zod";

import { paginationSchema } from "./baseSchemas";

export const mediaTypeSchema = z.enum(MediaType);

export const mediaEntryCreateSchema = z.object({
  movieId: z.string(),
  medium: mediaTypeSchema,
  version: z.string().optional(),
  note: z.string().optional(),
  price: z.number().min(0).optional(),
  isVirtual: z.boolean().default(false),
  isRipped: z.boolean().default(false),
});

export const mediaEntryUpdateSchema = z.object({
  id: z.string(),
  medium: mediaTypeSchema.optional(),
  version: z.string().optional(),
  note: z.string().optional(),
  price: z.number().min(0).optional(),
  isVirtual: z.boolean().optional(),
  isRipped: z.boolean().optional(),
});

export const mediaEntryGetAllSchema = z.object({
  medium: mediaTypeSchema.optional(),
  isVirtual: z.boolean().optional(),
  isRipped: z.boolean().optional(),
  skip: z.number().min(0).default(0),
  limit: z.number().min(1).max(100).default(20),
});

export const mediaEntryToggleRippedSchema = z.object({
  id: z.string(),
  isRipped: z.boolean(),
});

export const mediaEntryCollectionOverviewSchema = paginationSchema.extend({
  medium: mediaTypeSchema.optional(),
  isVirtual: z.boolean().optional(),
  isRipped: z.boolean().optional(),
  search: z.string().optional(),
});

export type MediaTypeInput = z.infer<typeof mediaTypeSchema>;
export type MediaEntryCreateInput = z.infer<typeof mediaEntryCreateSchema>;
export type MediaEntryUpdateInput = z.infer<typeof mediaEntryUpdateSchema>;
export type MediaEntryGetAllInput = z.infer<typeof mediaEntryGetAllSchema>;
export type MediaEntryToggleRippedInput = z.infer<
  typeof mediaEntryToggleRippedSchema
>;
export type MediaEntryCollectionOverviewInput = z.infer<
  typeof mediaEntryCollectionOverviewSchema
>;
