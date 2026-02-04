import { z } from "zod";

import { cinemaMetadataSchema } from "./cinemaSchemas";
import { paginationSchema } from "./baseSchemas";
import { streamingServiceSchema, watchLocationSchema } from "./watchSchemas";

export const baseMovieWatchSchema = z.object({
  rating: z.number().min(0).max(5).multipleOf(0.5).optional(),
  review: z.string().optional(),
  watchLocation: watchLocationSchema,
  streamingService: streamingServiceSchema.optional(),
  cinemaMetadata: cinemaMetadataSchema.optional(),
});

export const movieWatchCreateSchema = baseMovieWatchSchema.extend({
  movieId: z.string(),
  watchedAt: z.date().optional(),
  watchLocation: watchLocationSchema.default("ON_DEMAND"),
});

export const movieWatchUpdateSchema = z.object({
  id: z.string(),
  rating: z.number().min(0).max(5).multipleOf(0.5).optional(),
  review: z.string().optional(),
  watchedAt: z.date().optional(),
  watchLocation: watchLocationSchema.optional(),
  streamingService: streamingServiceSchema.optional(),
  cinemaMetadata: cinemaMetadataSchema.optional(),
});

export const movieWatchFormSchema = baseMovieWatchSchema.extend({
  watchedAt: z.date(),
});

export const movieWatchGetAllSchema = paginationSchema.extend({
  search: z.string().optional(),
  rating: z.enum(["all", "unrated", "1", "2", "3", "4", "5"]).default("all"),
});

export type BaseMovieWatchInput = z.infer<typeof baseMovieWatchSchema>;
export type MovieWatchCreateInput = z.infer<typeof movieWatchCreateSchema>;
export type MovieWatchUpdateInput = z.infer<typeof movieWatchUpdateSchema>;
export type MovieWatchFormInput = z.infer<typeof movieWatchFormSchema>;
export type MovieWatchGetAllInput = z.infer<typeof movieWatchGetAllSchema>;
