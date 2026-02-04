import { z } from "zod";

export const movieCreateSchema = z.object({
  tmdbId: z.string(),
});

export const movieUpdateSchema = z.object({
  id: z.string(),
  notes: z.string().optional(),
  isInWatchlist: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
});

export const movieSearchSchema = z.object({
  search: z.string().optional(),
  sort: z.enum(["title", "created", "watched"]).default("title"),
  skip: z.number().min(0).default(0),
  limit: z.number().min(1).max(100).default(20),
  watchlist: z.boolean().optional(),
  favorites: z.boolean().optional(),
});

export const movieTagSchema = z.object({
  movieId: z.string(),
  tagId: z.string(),
});

export const movieIdSchema = z.object({
  movieId: z.string(),
});

export const tmdbIdSchema = z.object({
  tmdbId: z.string(),
});

export const movieListCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export const movieListUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export const movieListEntrySchema = z.object({
  listId: z.string(),
  movieId: z.string(),
  order: z.number().default(0),
});

export const movieWithMediaSearchSchema = z.object({
  search: z.string().optional(),
});

export const advancedMovieFilterSchema = z.object({
  search: z.string().optional(),
  genres: z.array(z.string()).optional(),
  releaseYearMin: z.number().optional(),
  releaseYearMax: z.number().optional(),
  ratingMin: z.number().min(0).max(5).optional(),
  ratingMax: z.number().min(0).max(5).optional(),
  runtimeMin: z.number().optional(),
  runtimeMax: z.number().optional(),
  isInWatchlist: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  hasWatches: z.boolean().optional(),
  hasMediaEntries: z.boolean().optional(),
  tagIds: z.array(z.string()).optional(),
  sort: z
    .enum(["title", "created", "watched", "releaseYear", "rating", "runtime"])
    .default("created"),
  skip: z.number().min(0).default(0),
  limit: z.number().min(1).max(100).default(20),
});

export const bulkOperationSchema = z.object({
  movieIds: z.array(z.string()).min(1),
  operation: z.enum([
    "delete",
    "addToWatchlist",
    "removeFromWatchlist",
    "addToFavorites",
    "removeFromFavorites",
  ]),
  tagId: z.string().optional(),
});

export type MovieCreateInput = z.infer<typeof movieCreateSchema>;
export type MovieUpdateInput = z.infer<typeof movieUpdateSchema>;
export type MovieSearchInput = z.infer<typeof movieSearchSchema>;
export type MovieTagInput = z.infer<typeof movieTagSchema>;
export type MovieIdInput = z.infer<typeof movieIdSchema>;
export type TmdbIdInput = z.infer<typeof tmdbIdSchema>;
export type MovieListCreateInput = z.infer<typeof movieListCreateSchema>;
export type MovieListUpdateInput = z.infer<typeof movieListUpdateSchema>;
export type MovieListEntryInput = z.infer<typeof movieListEntrySchema>;
export type MovieWithMediaSearchInput = z.infer<typeof movieWithMediaSearchSchema>;
export type AdvancedMovieFilterInput = z.infer<typeof advancedMovieFilterSchema>;
export type BulkOperationInput = z.infer<typeof bulkOperationSchema>;
