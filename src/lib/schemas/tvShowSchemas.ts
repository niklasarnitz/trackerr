import { z } from "zod";

export const tvShowCreateSchema = z.object({
  tmdbId: z.string(),
});

export const tvShowUpdateSchema = z.object({
  id: z.string(),
  notes: z.string().optional(),
  isInWatchlist: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
});

export const tvShowSearchSchema = z.object({
  search: z.string().optional(),
  sort: z.enum(["title", "created", "watched"]).default("title"),
  skip: z.number().min(0).default(0),
  limit: z.number().min(1).max(100).default(20),
  watchlist: z.boolean().optional(),
  favorites: z.boolean().optional(),
});

export const tvShowTmdbIdSchema = z.object({
  tmdbId: z.string(),
});

export type TvShowCreateInput = z.infer<typeof tvShowCreateSchema>;
export type TvShowUpdateInput = z.infer<typeof tvShowUpdateSchema>;
export type TvShowSearchInput = z.infer<typeof tvShowSearchSchema>;
export type TvShowTmdbIdInput = z.infer<typeof tvShowTmdbIdSchema>;
