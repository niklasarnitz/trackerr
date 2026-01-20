import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { type Prisma } from "@prisma/client";
import { z } from "zod";
import {
  movieSearchSchema,
  idSchema,
  tmdbIdSchema,
  movieCreateSchema,
  movieWithMediaSearchSchema,
  movieUpdateSchema,
  bulkOperationSchema,
  advancedMovieFilterSchema,
} from "~/lib/api-schemas";
import { env } from "~/env";
import { downloadAndUploadMoviePoster } from "~/helpers/image-upload";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = env.TMDB_API_KEY;

const tmdbMovieWithCreditsSchema = z.object({
  id: z.number(),
  title: z.string(),
  original_title: z.string().nullable().optional(),
  release_date: z.string().nullable().optional(),
  runtime: z.number().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  overview: z.string().nullable().optional(),
  genres: z
    .array(z.object({ name: z.string() }))
    .optional()
    .default([]),
  credits: z
    .object({
      cast: z
        .array(
          z.object({
            name: z.string(),
            order: z.number().optional(),
          }),
        )
        .optional()
        .default([]),
      crew: z
        .array(
          z.object({
            name: z.string(),
            job: z.string().optional(),
          }),
        )
        .optional()
        .default([]),
    })
    .optional(),
});

type TmdbMovieWithCredits = z.infer<typeof tmdbMovieWithCreditsSchema>;

async function getTmdbMovieWithCredits(
  tmdbId: string,
): Promise<TmdbMovieWithCredits> {
  if (!TMDB_API_KEY) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "TMDB API key not configured",
    });
  }

  const url = new URL(`${TMDB_BASE_URL}/movie/${tmdbId}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("append_to_response", "credits");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new TRPCError({
      code: response.status === 404 ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
      message:
        response.status === 404
          ? "Movie not found on TMDB"
          : "Failed to fetch movie details from TMDB",
    });
  }

  const data = (await response.json()) as unknown;
  return tmdbMovieWithCreditsSchema.parse(data);
}

function mapReleaseYear(releaseDate?: string | null): number | null {
  if (!releaseDate) return null;
  const year = Number(releaseDate.slice(0, 4));
  if (!Number.isFinite(year) || year < 1800 || year > 3000) return null;
  return year;
}

function mapDirector(movie: TmdbMovieWithCredits): string | null {
  const crew = movie.credits?.crew ?? [];
  const director = crew.find((c) => (c.job ?? "").toLowerCase() === "director");
  return director?.name ?? null;
}

function mapCast(movie: TmdbMovieWithCredits, limit = 10): string[] {
  const cast = movie.credits?.cast ?? [];
  return cast
    .slice()
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
    .map((c) => c.name)
    .filter((n) => n.trim() !== "")
    .slice(0, limit);
}

function mapGenres(movie: TmdbMovieWithCredits): string[] {
  return (movie.genres ?? []).map((g) => g.name).filter((n) => n.trim() !== "");
}

export const movieRouter = createTRPCRouter({
  // Get all movies for current user
  getAll: protectedProcedure
    .input(movieSearchSchema)
    .query(async ({ ctx, input }) => {
      // For other sorting options, use Prisma's orderBy
      let orderBy;
      switch (input.sort) {
        case "created":
          orderBy = { createdAt: "desc" as const };
          break;
        case "watched":
          orderBy = { lastWatchedAt: "desc" as const };
          break;
        case "title":
        default:
          orderBy = { title: "asc" as const };
          break;
      }

      const movies = await ctx.db.movie.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input.search && {
            OR: [
              { title: { contains: input.search, mode: "insensitive" } },
              {
                originalTitle: { contains: input.search, mode: "insensitive" },
              },
            ],
          }),
          ...(input.watchlist && { isInWatchlist: true }),
          ...(input.favorites && { isFavorite: true }),
        },
        include: {
          mediaEntries: true,
          watches: {
            orderBy: { watchedAt: "desc" },
            take: 1,
          },
          _count: {
            select: {
              watches: true,
              mediaEntries: true,
            },
          },
        },
        orderBy,
        skip: input.skip,
        take: input.limit,
      });

      const total = await ctx.db.movie.count({
        where: {
          userId: ctx.session.user.id,
          ...(input.search && {
            OR: [
              { title: { contains: input.search, mode: "insensitive" } },
              {
                originalTitle: { contains: input.search, mode: "insensitive" },
              },
            ],
          }),
          ...(input.watchlist && { isInWatchlist: true }),
          ...(input.favorites && { isFavorite: true }),
        },
      });

      return {
        movies,
        total,
        hasMore: input.skip + input.limit < total,
      };
    }),

  // Get single movie by ID
  getById: protectedProcedure.input(idSchema).query(async ({ ctx, input }) => {
    const movie = await ctx.db.movie.findFirst({
      where: {
        id: input.id,
        userId: ctx.session.user.id,
      },
      include: {
        mediaEntries: {
          orderBy: { createdAt: "desc" },
        },
        watches: {
          orderBy: { watchedAt: "desc" },
          include: {
            cinemaWatchMetadata: true,
            externalActionMetadataTags: true,
          },
        },
        _count: {
          select: {
            mediaEntries: true,
            watches: true,
          },
        },
      },
    });

    if (!movie) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Movie not found",
      });
    }

    return movie;
  }),

  // Get single movie by TMDB ID
  getByTmdbId: protectedProcedure
    .input(tmdbIdSchema)
    .query(async ({ ctx, input }) => {
      const movie = await ctx.db.movie.findFirst({
        where: {
          tmdbId: input.tmdbId,
          userId: ctx.session.user.id,
        },
        include: {
          mediaEntries: {
            orderBy: { createdAt: "desc" },
          },
          watches: {
            orderBy: { watchedAt: "desc" },
          },
          _count: {
            select: {
              mediaEntries: true,
              watches: true,
            },
          },
        },
      });

      if (!movie) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Movie not found in your collection",
        });
      }

      return movie;
    }),

  // Create movie from TMDB
  create: protectedProcedure
    .input(movieCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if movie already exists for this user
      const existingMovie = await ctx.db.movie.findUnique({
        where: {
          userId_tmdbId: {
            userId: ctx.session.user.id,
            tmdbId: input.tmdbId,
          },
        },
      });

      if (existingMovie) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Movie already exists in your collection",
        });
      }

      let tmdb: TmdbMovieWithCredits;
      try {
        tmdb = await getTmdbMovieWithCredits(input.tmdbId);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch movie metadata from TMDB",
          cause: error,
        });
      }

      // Create movie first to get the ID
      const movie = await ctx.db.movie.create({
        data: {
          userId: ctx.session.user.id,
          tmdbId: input.tmdbId,
          title: tmdb.title,
          originalTitle: (tmdb.original_title ?? "").trim() || null,
          releaseYear: mapReleaseYear(tmdb.release_date),
          runtime: tmdb.runtime ?? null,
          posterPath: null, // Will be updated after upload
          overview: (tmdb.overview ?? "").trim() || null,
          genres: mapGenres(tmdb),
          director: mapDirector(tmdb),
          cast: mapCast(tmdb, 10),
        },
      });

      // Download and upload poster to Minio if available
      if (tmdb.poster_path) {
        try {
          const { url, blurDataUrl } = await downloadAndUploadMoviePoster(
            movie.id,
            tmdb.poster_path,
          );
          await ctx.db.movie.update({
            where: { id: movie.id },
            data: {
              posterPath: url,
              blurDataUrl,
            },
          });
        } catch (error) {
          console.error("Failed to upload poster to Minio:", error);
          // Keep the movie but without poster - don't fail the whole operation
        }
      }

      return movie;
    }),

  // Delete movie
  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const movie = await ctx.db.movie.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!movie) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Movie not found",
        });
      }

      return await ctx.db.movie.delete({
        where: { id: input.id },
      });
    }),

  // Get movies with physical media (preferred in search)
  getWithMedia: protectedProcedure
    .input(movieWithMediaSearchSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.movie.findMany({
        where: {
          userId: ctx.session.user.id,
          mediaEntries: {
            some: {},
          },
          ...(input.search && {
            OR: [
              { title: { contains: input.search, mode: "insensitive" } },
              {
                originalTitle: { contains: input.search, mode: "insensitive" },
              },
            ],
          }),
        },
        include: {
          mediaEntries: true,
          _count: {
            select: { watches: true },
          },
        },
        orderBy: { title: "asc" },
      });
    }),

  // Update movie (notes, watchlist, favorites)
  update: protectedProcedure
    .input(movieUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const movie = await ctx.db.movie.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });

      if (!movie) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Movie not found",
        });
      }

      return await ctx.db.movie.update({
        where: { id },
        data: updateData,
      });
    }),

  // Toggle watchlist status
  toggleWatchlist: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const movie = await ctx.db.movie.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!movie) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Movie not found",
        });
      }

      return await ctx.db.movie.update({
        where: { id: input.id },
        data: { isInWatchlist: !movie.isInWatchlist },
      });
    }),

  // Toggle favorite status
  toggleFavorite: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const movie = await ctx.db.movie.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!movie) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Movie not found",
        });
      }

      return await ctx.db.movie.update({
        where: { id: input.id },
        data: { isFavorite: !movie.isFavorite },
      });
    }),

  // Get watchlist movies
  getWatchlist: protectedProcedure
    .input(movieSearchSchema)
    .query(async ({ ctx, input }) => {
      const movies = await ctx.db.movie.findMany({
        where: {
          userId: ctx.session.user.id,
          isInWatchlist: true,
          ...(input.search && {
            OR: [
              { title: { contains: input.search, mode: "insensitive" } },
              {
                originalTitle: { contains: input.search, mode: "insensitive" },
              },
            ],
          }),
        },
        include: {
          mediaEntries: true,
          _count: {
            select: {
              watches: true,
              mediaEntries: true,
            },
          },
        },
        orderBy: { title: "asc" },
        skip: input.skip,
        take: input.limit,
      });

      const total = await ctx.db.movie.count({
        where: {
          userId: ctx.session.user.id,
          isInWatchlist: true,
          ...(input.search && {
            OR: [
              { title: { contains: input.search, mode: "insensitive" } },
              {
                originalTitle: { contains: input.search, mode: "insensitive" },
              },
            ],
          }),
        },
      });

      return {
        movies,
        total,
        hasMore: input.skip + input.limit < total,
      };
    }),

  // Get favorite movies
  getFavorites: protectedProcedure
    .input(movieSearchSchema)
    .query(async ({ ctx, input }) => {
      const movies = await ctx.db.movie.findMany({
        where: {
          userId: ctx.session.user.id,
          isFavorite: true,
          ...(input.search && {
            OR: [
              { title: { contains: input.search, mode: "insensitive" } },
              {
                originalTitle: { contains: input.search, mode: "insensitive" },
              },
            ],
          }),
        },
        include: {
          mediaEntries: true,
          _count: {
            select: {
              watches: true,
              mediaEntries: true,
            },
          },
        },
        orderBy: { title: "asc" },
        skip: input.skip,
        take: input.limit,
      });

      const total = await ctx.db.movie.count({
        where: {
          userId: ctx.session.user.id,
          isFavorite: true,
          ...(input.search && {
            OR: [
              { title: { contains: input.search, mode: "insensitive" } },
              {
                originalTitle: { contains: input.search, mode: "insensitive" },
              },
            ],
          }),
        },
      });

      return {
        movies,
        total,
        hasMore: input.skip + input.limit < total,
      };
    }),

  // Advanced filtering
  getFiltered: protectedProcedure
    .input(advancedMovieFilterSchema)
    .query(async ({ ctx, input }) => {
      const where: Prisma.MovieWhereInput = {
        userId: ctx.session.user.id,
      };

      if (input.search) {
        where.OR = [
          { title: { contains: input.search, mode: "insensitive" } },
          {
            originalTitle: { contains: input.search, mode: "insensitive" },
          },
        ];
      }

      if (input.genres && input.genres.length > 0) {
        where.genres = { hasSome: input.genres };
      }

      if (input.releaseYearMin || input.releaseYearMax) {
        where.releaseYear = {};
        if (input.releaseYearMin) {
          where.releaseYear.gte = input.releaseYearMin;
        }
        if (input.releaseYearMax) {
          where.releaseYear.lte = input.releaseYearMax;
        }
      }

      if (input.runtimeMin || input.runtimeMax) {
        where.runtime = {};
        if (input.runtimeMin) {
          where.runtime.gte = input.runtimeMin;
        }
        if (input.runtimeMax) {
          where.runtime.lte = input.runtimeMax;
        }
      }

      if (input.isInWatchlist !== undefined) {
        where.isInWatchlist = input.isInWatchlist;
      }

      if (input.isFavorite !== undefined) {
        where.isFavorite = input.isFavorite;
      }

      if (input.hasWatches !== undefined) {
        if (input.hasWatches) {
          where.watches = { some: {} };
        } else {
          where.watches = { none: {} };
        }
      }

      if (input.hasMediaEntries !== undefined) {
        if (input.hasMediaEntries) {
          where.mediaEntries = { some: {} };
        } else {
          where.mediaEntries = { none: {} };
        }
      }

      if (input.tagIds && input.tagIds.length > 0) {
        where.movieTags = {
          some: {
            tagId: { in: input.tagIds },
          },
        };
      }

      let orderBy: Prisma.MovieOrderByWithRelationInput = { title: "asc" };
      switch (input.sort) {
        case "created":
          orderBy = { createdAt: "desc" };
          break;
        case "releaseYear":
          orderBy = { releaseYear: "desc" };
          break;
        case "runtime":
          orderBy = { runtime: "desc" };
          break;
        case "watched":
          orderBy = { lastWatchedAt: "desc" };
          break;
        case "title":
        default:
          orderBy = { title: "asc" };
          break;
      }

      const movies = await ctx.db.movie.findMany({
        where,
        include: {
          mediaEntries: true,
          movieTags: {
            include: {
              tag: true,
            },
          },
          watches: {
            orderBy: { watchedAt: "desc" },
            take: 1,
          },
          _count: {
            select: {
              watches: true,
              mediaEntries: true,
            },
          },
        },
        orderBy,
        skip: input.skip,
        take: input.limit,
      });

      // Handle rating sort (requires aggregation)
      if (input.sort === "rating") {
        const moviesWithRatings = await Promise.all(
          movies.map(async (movie) => {
            const avgRating = await ctx.db.movieWatch.aggregate({
              where: {
                movieId: movie.id,
                userId: ctx.session.user.id,
                rating: { not: null },
              },
              _avg: { rating: true },
            });
            return {
              ...movie,
              _avgRating: avgRating._avg.rating ?? 0,
            };
          }),
        );
        moviesWithRatings.sort((a, b) => b._avgRating - a._avgRating);
        return {
          movies: moviesWithRatings,
          total: await ctx.db.movie.count({ where }),
          hasMore:
            input.skip + input.limit < (await ctx.db.movie.count({ where })),
        };
      }

      const total = await ctx.db.movie.count({ where });

      return {
        movies,
        total,
        hasMore: input.skip + input.limit < total,
      };
    }),

  // Bulk operations
  bulkOperation: protectedProcedure
    .input(bulkOperationSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify all movies belong to user
      const movies = await ctx.db.movie.findMany({
        where: {
          id: { in: input.movieIds },
          userId,
        },
      });

      if (movies.length !== input.movieIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Some movies do not belong to you",
        });
      }

      switch (input.operation) {
        case "delete":
          await ctx.db.movie.deleteMany({
            where: {
              id: { in: input.movieIds },
              userId,
            },
          });
          return { success: true, count: input.movieIds.length };

        case "addToWatchlist":
          await ctx.db.movie.updateMany({
            where: {
              id: { in: input.movieIds },
              userId,
            },
            data: { isInWatchlist: true },
          });
          return { success: true, count: input.movieIds.length };

        case "removeFromWatchlist":
          await ctx.db.movie.updateMany({
            where: {
              id: { in: input.movieIds },
              userId,
            },
            data: { isInWatchlist: false },
          });
          return { success: true, count: input.movieIds.length };

        case "addToFavorites":
          await ctx.db.movie.updateMany({
            where: {
              id: { in: input.movieIds },
              userId,
            },
            data: { isFavorite: true },
          });
          return { success: true, count: input.movieIds.length };

        case "removeFromFavorites":
          await ctx.db.movie.updateMany({
            where: {
              id: { in: input.movieIds },
              userId,
            },
            data: { isFavorite: false },
          });
          return { success: true, count: input.movieIds.length };

        default:
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid operation",
          });
      }
    }),
});
