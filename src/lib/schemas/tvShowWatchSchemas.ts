import { z } from "zod";

import { streamingServiceSchema, watchLocationSchema } from "./watchSchemas";

export const tvShowWatchCreateSchema = z.object({
  tvShowId: z.string(),
  episodeId: z.string().optional(),
  watchedAt: z.date().optional(),
  rating: z.number().min(0).max(5).optional(),
  review: z.string().optional(),
  watchLocation: watchLocationSchema.default("ON_DEMAND"),
  streamingService: streamingServiceSchema.optional(),
});

export const tvShowWatchUpdateSchema = z.object({
  id: z.string(),
  watchedAt: z.date().optional(),
  rating: z.number().min(0).max(5).optional(),
  review: z.string().optional(),
  watchLocation: watchLocationSchema.optional(),
  streamingService: streamingServiceSchema.optional(),
});

export type TvShowWatchCreateInput = z.infer<typeof tvShowWatchCreateSchema>;
export type TvShowWatchUpdateInput = z.infer<typeof tvShowWatchUpdateSchema>;
