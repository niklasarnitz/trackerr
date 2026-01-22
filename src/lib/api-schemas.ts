import { z } from "zod";

// ============================================================================
// Base Schemas
// ============================================================================

export const movieIdSchema = z.object({
  movieId: z.string(),
});

export const idSchema = z.object({
  id: z.string(),
});

export const tmdbIdSchema = z.object({
  tmdbId: z.string(),
});

export const paginationSchema = z.object({
  skip: z.number().min(0).default(0),
  limit: z.number().min(1).max(100).default(20),
});

// ============================================================================
// Movie Schemas
// ============================================================================

export const movieSearchSchema = z.object({
  search: z.string().optional(),
  sort: z.enum(["title", "created", "watched"]).default("title"),
  skip: z.number().min(0).default(0),
  limit: z.number().min(1).max(100).default(20),
  watchlist: z.boolean().optional(),
  favorites: z.boolean().optional(),
});

export const movieCreateSchema = z.object({
  tmdbId: z.string(),
});

export const movieUpdateSchema = z.object({
  id: z.string(),
  notes: z.string().optional(),
  isInWatchlist: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
});

export const movieWithMediaSearchSchema = z.object({
  search: z.string().optional(),
});

// ============================================================================
// Movie Watch Schemas
// ============================================================================

export const movieWatchGetAllSchema = paginationSchema.extend({
  search: z.string().optional(),
  rating: z.enum(["all", "unrated", "1", "2", "3", "4", "5"]).default("all"),
});

export const cinemaMetadataSchema = z.object({
  cinemaName: z.string().optional(),
  soundSystemType: z
    .enum([
      "MONO",
      "STEREO",
      "DOLBY_SURROUND",
      "DOLBY_DIGITAL",
      "DOLBY_5_1",
      "DOLBY_7_1",
      "DOLBY_ATMOS",
      "DTS",
      "DTS_X",
      "DTS_70MM",
      "SDDS",
      "IMAX",
      "OTHER",
    ])
    .optional(),
  projectionType: z
    .enum([
      "DIGITAL_2D",
      "DIGITAL_3D",
      "DIGITAL_IMAX",
      "IMAX_3D",
      "ANALOG_16MM",
      "ANALOG_35MM",
      "ANALOG_70MM",
      "OTHER",
    ])
    .optional(),
  languageType: z
    .enum(["ORIGINAL", "ORIGINAL_WITH_SUBTITLES", "DUBBED", "OTHER"])
    .optional(),
  aspectRatio: z
    .enum([
      "ACADEMY_4_3",
      "IMAX_143_1",
      "RATIO_147_1",
      "EUROPEAN_166_1",
      "STANDARD_16_9",
      "FLAT_185_1",
      "IMAX_190_1",
      "VISTAVISION_196_1",
      "TODD_AO_221_1",
      "SCOPE_235_1",
      "SCOPE_239_1",
      "SUPER_35_240_1",
      "CINERAMA_276_1",
      "OTHER",
    ])
    .optional(),
  ticketPrice: z.number().min(0).optional(),
});

// Base movie watch schema for shared fields
export const baseMovieWatchSchema = z.object({
  rating: z.number().min(0).max(5).multipleOf(0.5).optional(),
  review: z.string().optional(),
  watchLocation: z.enum(["ON_DEMAND", "CINEMA", "TV", "OTHER"]),
  streamingService: z
    .enum([
      "HOME_MEDIA_LIBRARY",
      "NETFLIX",
      "PRIME_VIDEO",
      "DISNEY_PLUS",
      "HBO_MAX",
      "APPLE_TV_PLUS",
      "HULU",
      "PARAMOUNT_PLUS",
      "PEACOCK",
      "YOUTUBE_PREMIUM",
      "CRUNCHYROLL",
      "MAX",
      "OTHER",
    ])
    .optional(),
  cinemaMetadata: cinemaMetadataSchema.optional(),
});

export const movieWatchCreateSchema = baseMovieWatchSchema.extend({
  movieId: z.string(),
  watchedAt: z.date().optional(),
  watchLocation: z
    .enum(["ON_DEMAND", "CINEMA", "TV", "OTHER"])
    .default("ON_DEMAND"),
});

export const movieWatchFormSchema = baseMovieWatchSchema.extend({
  watchedAt: z.date(),
});

export const movieWatchUpdateSchema = z.object({
  id: z.string(),
  rating: z.number().min(0).max(5).multipleOf(0.5).optional(),
  review: z.string().optional(),
  watchedAt: z.date().optional(),
  watchLocation: z.enum(["ON_DEMAND", "CINEMA", "TV", "OTHER"]).optional(),
  streamingService: z
    .enum([
      "HOME_MEDIA_LIBRARY",
      "NETFLIX",
      "PRIME_VIDEO",
      "DISNEY_PLUS",
      "HBO_MAX",
      "APPLE_TV_PLUS",
      "HULU",
      "PARAMOUNT_PLUS",
      "PEACOCK",
      "YOUTUBE_PREMIUM",
      "CRUNCHYROLL",
      "MAX",
      "OTHER",
    ])
    .optional(),
  cinemaMetadata: cinemaMetadataSchema.optional(),
});

// ============================================================================
// Media Entry Schemas
// ============================================================================

export const mediaEntryCreateSchema = z.object({
  movieId: z.string(),
  medium: z.enum([
    "BLURAY",
    "BLURAY4K",
    "DVD",
    "DIGITAL",
    "LASERDISC",
    "STREAM",
    "FILE",
    "VHS",
    "OTHER",
  ]),
  version: z.string().optional(),
  note: z.string().optional(),
  price: z.number().min(0).optional(),
  isVirtual: z.boolean().default(false),
  isRipped: z.boolean().default(false),
});

export const mediaEntryUpdateSchema = z.object({
  id: z.string(),
  medium: z
    .enum([
      "BLURAY",
      "BLURAY4K",
      "DVD",
      "DIGITAL",
      "LASERDISC",
      "STREAM",
      "FILE",
      "VHS",
      "OTHER",
    ])
    .optional(),
  version: z.string().optional(),
  note: z.string().optional(),
  price: z.number().min(0).optional(),
  isVirtual: z.boolean().optional(),
  isRipped: z.boolean().optional(),
});

export const mediaEntryToggleRippedSchema = z.object({
  id: z.string(),
  isRipped: z.boolean(),
});

export const mediaEntryGetAllSchema = z.object({
  medium: z
    .enum([
      "BLURAY",
      "BLURAY4K",
      "DVD",
      "DIGITAL",
      "LASERDISC",
      "STREAM",
      "FILE",
      "VHS",
      "OTHER",
    ])
    .optional(),
  isVirtual: z.boolean().optional(),
  isRipped: z.boolean().optional(),
  skip: z.number().min(0).default(0),
  limit: z.number().min(1).max(100).default(20),
});

export const mediaEntryCollectionOverviewSchema = paginationSchema.extend({
  medium: z
    .enum([
      "BLURAY",
      "BLURAY4K",
      "DVD",
      "DIGITAL",
      "LASERDISC",
      "STREAM",
      "FILE",
      "VHS",
      "OTHER",
    ])
    .optional(),
  isVirtual: z.boolean().optional(),
  isRipped: z.boolean().optional(),
  search: z.string().optional(),
});

// ============================================================================
// Cinema Schemas
// ============================================================================

export const cinemaSearchSchema = z.object({
  search: z.string().min(1),
});

// ============================================================================
// Tag Schemas
// ============================================================================

export const tagCreateSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().optional(),
});

export const tagUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50).optional(),
  color: z.string().optional(),
});

export const movieTagSchema = z.object({
  movieId: z.string(),
  tagId: z.string(),
});

// ============================================================================
// Movie List Schemas
// ============================================================================

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

// ============================================================================
// Loan Schemas
// ============================================================================

export const loanCreateSchema = z.object({
  mediaEntryId: z.string(),
  borrowerName: z.string().min(1),
  notes: z.string().optional(),
});

export const loanUpdateSchema = z.object({
  id: z.string(),
  returnedAt: z.date().nullable().optional(),
  notes: z.string().optional(),
});

// ============================================================================
// Reminder Schemas
// ============================================================================

export const reminderCreateSchema = z.object({
  movieId: z.string().optional(),
  title: z.string().min(1).max(200),
  message: z.string().optional(),
  remindAt: z.date(),
});

export const reminderUpdateSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200).optional(),
  message: z.string().optional(),
  remindAt: z.date().optional(),
  isSent: z.boolean().optional(),
});

// ============================================================================
// Bulk Operations Schemas
// ============================================================================

export const bulkOperationSchema = z.object({
  movieIds: z.array(z.string()).min(1),
  operation: z.enum([
    "delete",
    "addToWatchlist",
    "removeFromWatchlist",
    "addToFavorites",
    "removeFromFavorites",
  ]),
  tagId: z.string().optional(), // For tag operations
});

// ============================================================================
// Advanced Filter Schema
// ============================================================================

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

// ============================================================================
// Type Exports
// ============================================================================

export type MovieSearchInput = z.infer<typeof movieSearchSchema>;
export type MovieCreateInput = z.infer<typeof movieCreateSchema>;
export type MovieWithMediaSearchInput = z.infer<
  typeof movieWithMediaSearchSchema
>;

export type CinemaSearchInput = z.infer<typeof cinemaSearchSchema>;
export type CinemaMetadataInput = z.infer<typeof cinemaMetadataSchema>;
export type MovieWatchCreateInput = z.infer<typeof movieWatchCreateSchema>;
export type MovieWatchUpdateInput = z.infer<typeof movieWatchUpdateSchema>;
export type MovieWatchFormInput = z.infer<typeof movieWatchFormSchema>;

export type MediaEntryCreateInput = z.infer<typeof mediaEntryCreateSchema>;
export type MediaEntryUpdateInput = z.infer<typeof mediaEntryUpdateSchema>;
export type MediaEntryToggleRippedInput = z.infer<
  typeof mediaEntryToggleRippedSchema
>;
export type MediaEntryGetAllInput = z.infer<typeof mediaEntryGetAllSchema>;
export type MediaEntryCollectionOverviewInput = z.infer<
  typeof mediaEntryCollectionOverviewSchema
>;

// ============================================================================
// Book Schemas
// ============================================================================

export const bookIdSchema = z.object({
  bookId: z.string(),
});

export const bookSearchSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["UNREAD", "READING", "READ"]).optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  sort: z.enum(["title", "created", "updated", "author"]).default("title"),
  skip: z.number().min(0).default(0),
  limit: z.number().min(1).max(100).default(20),
});

export const bookAuthorSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional(), // e.g., "Herausgeber", "Editor", "Translator"
});

export const bookCreateSchema = z.object({
  isbn: z.string().optional(),
  title: z.string().min(1),
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
  isEbook: z.boolean().default(false),
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
  categoryId: z.string().optional(),
  status: z.enum(["UNREAD", "READING", "READ"]).optional(),
  notes: z.string().optional(),
});

// ============================================================================
// Reading Progress Schemas
// ============================================================================

export const readingProgressCreateSchema = z.object({
  bookId: z.string(),
  pagesRead: z.number().int().min(0),
});

export const readingProgressGetByBookSchema = z.object({
  bookId: z.string(),
});

// ============================================================================
// Book Category Schemas
// ============================================================================

export const bookCategoryCreateSchema = z.object({
  name: z.string().min(1).max(50),
});

export const bookCategoryUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
});

// ============================================================================
// Book Tag Schemas
// ============================================================================

export const bookTagSchema = z.object({
  bookId: z.string(),
  tagId: z.string(),
});

// ============================================================================
// Book Type Exports
// ============================================================================

export type BookSearchInput = z.infer<typeof bookSearchSchema>;
export type BookAuthorInput = z.infer<typeof bookAuthorSchema>;
export type BookCreateInput = z.infer<typeof bookCreateSchema>;
export type BookUpdateInput = z.infer<typeof bookUpdateSchema>;
export type ReadingProgressCreateInput = z.infer<
  typeof readingProgressCreateSchema
>;
export type ReadingProgressGetByBookInput = z.infer<
  typeof readingProgressGetByBookSchema
>;
export type BookCategoryCreateInput = z.infer<typeof bookCategoryCreateSchema>;
export type BookCategoryUpdateInput = z.infer<typeof bookCategoryUpdateSchema>;
export type BookTagInput = z.infer<typeof bookTagSchema>;

// ============================================================================
// TV Show Schemas
// ============================================================================

export const tvShowSearchSchema = z.object({
  search: z.string().optional(),
  sort: z.enum(["title", "created", "watched"]).default("title"),
  skip: z.number().min(0).default(0),
  limit: z.number().min(1).max(100).default(20),
  watchlist: z.boolean().optional(),
  favorites: z.boolean().optional(),
});

export const tvShowCreateSchema = z.object({
  tmdbId: z.string(),
});

export const tvShowUpdateSchema = z.object({
  id: z.string(),
  notes: z.string().optional(),
  isInWatchlist: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
});

export const tvShowTmdbIdSchema = z.object({
  tmdbId: z.string(),
});

// ============================================================================
// TV Show Watch Schemas
// ============================================================================

export const tvShowWatchCreateSchema = z.object({
  tvShowId: z.string(),
  episodeId: z.string().optional(),
  watchedAt: z.date().optional(),
  rating: z.number().min(0).max(5).optional(),
  review: z.string().optional(),
  watchLocation: z
    .enum(["ON_DEMAND", "CINEMA", "TV_BROADCAST", "OTHER"])
    .default("ON_DEMAND"),
  streamingService: z
    .enum([
      "HOME_MEDIA_LIBRARY",
      "NETFLIX",
      "PRIME_VIDEO",
      "DISNEY_PLUS",
      "HBO_MAX",
      "APPLE_TV_PLUS",
      "HULU",
      "PARAMOUNT_PLUS",
      "PEACOCK",
      "YOUTUBE_PREMIUM",
      "CRUNCHYROLL",
      "MAX",
      "OTHER",
    ])
    .optional(),
});

export const tvShowWatchUpdateSchema = z.object({
  id: z.string(),
  watchedAt: z.date().optional(),
  rating: z.number().min(0).max(5).optional(),
  review: z.string().optional(),
  watchLocation: z
    .enum(["ON_DEMAND", "CINEMA", "TV_BROADCAST", "OTHER"])
    .optional(),
  streamingService: z
    .enum([
      "HOME_MEDIA_LIBRARY",
      "NETFLIX",
      "PRIME_VIDEO",
      "DISNEY_PLUS",
      "HBO_MAX",
      "APPLE_TV_PLUS",
      "HULU",
      "PARAMOUNT_PLUS",
      "PEACOCK",
      "YOUTUBE_PREMIUM",
      "CRUNCHYROLL",
      "MAX",
      "OTHER",
    ])
    .optional(),
});

// ============================================================================
// TV Show Type Exports
// ============================================================================

export type TvShowSearchInput = z.infer<typeof tvShowSearchSchema>;
export type TvShowCreateInput = z.infer<typeof tvShowCreateSchema>;
export type TvShowUpdateInput = z.infer<typeof tvShowUpdateSchema>;
export type TvShowWatchCreateInput = z.infer<typeof tvShowWatchCreateSchema>;
export type TvShowWatchUpdateInput = z.infer<typeof tvShowWatchUpdateSchema>;

// ============================================================================
// Quote Schemas
// ============================================================================

export const quoteSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional().nullable(),
  pageStart: z.coerce.number().int().min(1, "Page number must be at least 1"),
  pageEnd: z.coerce
    .number()
    .int()
    .min(1, "Page number must be at least 1")
    .optional()
    .nullable(),
  text: z.string().min(1, "Quote text is required"),
  bookId: z.string().min(1, "Book ID is required"),
});

// ============================================================================
// Book Series Schemas
// ============================================================================

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

export type QuoteInput = z.infer<typeof quoteSchema>;
export type BookSeriesCreateInput = z.infer<typeof bookSeriesCreateSchema>;
export type BookSeriesUpdateInput = z.infer<typeof bookSeriesUpdateSchema>;
export type BookSeriesSearchInput = z.infer<typeof bookSeriesSearchSchema>;
