import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { idSchema } from "~/lib/api-schemas";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = env.TMDB_API_KEY;

const tmdbRecommendationMovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  original_title: z.string().nullable().optional(),
  release_date: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  poster_path: z.string().nullable().optional(),
  overview: z.string().optional().default(""),
  vote_average: z.number().nullable().optional().default(0),
  vote_count: z.number().nullable().optional().default(0),
  popularity: z.number().nullable().optional().default(0),
});

const tmdbRecommendationsResponseSchema = z.object({
  page: z.number().optional(),
  results: z.array(tmdbRecommendationMovieSchema).optional().default([]),
  total_pages: z.number().optional(),
  total_results: z.number().optional(),
});

type TmdbRecommendationMovie = z.infer<typeof tmdbRecommendationMovieSchema>;

async function getTmdbRecommendationsForMovie(tmdbId: string): Promise<TmdbRecommendationMovie[]> {
  if (!TMDB_API_KEY) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "TMDB API key not configured",
    });
  }

  const url = new URL(`${TMDB_BASE_URL}/movie/${tmdbId}/recommendations`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("page", "1");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get recommendations from TMDB",
    });
  }

  const data = (await response.json()) as unknown;
  const parsed = tmdbRecommendationsResponseSchema.parse(data);
  return parsed.results;
}

export const recommendationRouter = createTRPCRouter({
  // Get recommendations based on watch history
  getRecommendations: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).optional() }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { limit: requestedLimit } = (input ?? {}) as { limit?: number };
      const limit = typeof requestedLimit === "number" ? requestedLimit : 100;

      // Get user's top rated movies
      const topRatedWatches = await ctx.db.movieWatch.findMany({
        where: {
          userId,
          rating: { not: null, gte: 4 },
        },
        include: {
          movie: true,
        },
        orderBy: {
          rating: "desc",
        },
        take: 20,
      });

      // Extract genres from top rated movies
      const favoriteGenres = new Map<string, number>();
      topRatedWatches.forEach((watch) => {
        watch.movie.genres?.forEach((genre) => {
          favoriteGenres.set(genre, (favoriteGenres.get(genre) ?? 0) + 1);
        });
      });

      // Get top 3 genres
      const topGenres = Array.from(favoriteGenres.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre]) => genre);

      // Get movies user already has
      const userMovieTmdbIds = await ctx.db.movie.findMany({
        where: { userId },
        select: { id: true, tmdbId: true },
      });
      const userMoviesMap = new Map(userMovieTmdbIds.map((m) => [m.tmdbId, m.id]));

      const userMovieIdToTmdbId = new Map(userMovieTmdbIds.map((m) => [m.id, m.tmdbId]));
      const watchedMovieIds = await ctx.db.movieWatch.findMany({
        where: {
          userId,
          movieId: { in: userMovieTmdbIds.map((m) => m.id) },
        },
        select: { movieId: true },
        distinct: ["movieId"],
      });
      const watchedTmdbIds = new Set(
        watchedMovieIds
          .map((w) => userMovieIdToTmdbId.get(w.movieId))
          .filter((id): id is string => typeof id === "string" && id.trim() !== ""),
      );

      // Get movies with similar genres that user doesn't have
      const seedTmdbIds = topRatedWatches
        .map((watch) => watch.movie.tmdbId)
        .filter((id): id is string => typeof id === "string" && id.trim() !== "")
        .slice(0, 5);

      const seedRecommendations = await Promise.all(
        seedTmdbIds.map(async (tmdbId) => {
          try {
            return await getTmdbRecommendationsForMovie(tmdbId);
          } catch {
            return [];
          }
        }),
      );

      const aggregated = new Map<
        string,
        {
          movie: TmdbRecommendationMovie;
          sources: number;
        }
      >();

      for (const list of seedRecommendations) {
        for (const movie of list) {
          const key = movie.id.toString();
          const existing = aggregated.get(key);
          if (!existing) {
            aggregated.set(key, { movie, sources: 1 });
            continue;
          }
          aggregated.set(key, { movie: existing.movie, sources: existing.sources + 1 });
        }
      }

      const sorted = Array.from(aggregated.values())
        .sort((a, b) => {
          if (a.sources !== b.sources) return b.sources - a.sources;
          if ((a.movie.popularity ?? 0) !== (b.movie.popularity ?? 0)) {
            return (b.movie.popularity ?? 0) - (a.movie.popularity ?? 0);
          }
          if ((a.movie.vote_count ?? 0) !== (b.movie.vote_count ?? 0)) {
            return (b.movie.vote_count ?? 0) - (a.movie.vote_count ?? 0);
          }
          return (b.movie.vote_average ?? 0) - (a.movie.vote_average ?? 0);
        })
        .map(({ movie }) => movie);

      const mappedRecommendations = sorted
        .slice(0, Math.max(limit * 3, limit))
        .map((movie) => {
          const releaseYear =
            movie.release_date && movie.release_date.trim() !== ""
              ? new Date(movie.release_date).getFullYear()
              : null;

          const tmdbId = movie.id.toString();
          const movieId = userMoviesMap.get(tmdbId) ?? null;

          return {
            id: tmdbId,
            title: movie.title,
            originalTitle: movie.original_title ?? null,
            releaseYear,
            posterPath: movie.poster_path ?? null,
            overview: movie.overview,
            voteAverage: movie.vote_average,
            voteCount: movie.vote_count,
            popularity: movie.popularity,
            inCollection: movieId !== null,
            movieId,
          };
        })
        .filter((movie) => movie.id && movie.title)
        .filter((movie) => !watchedTmdbIds.has(movie.id))
        .slice(0, limit);

      return {
        recommendations: mappedRecommendations,
        basedOnGenres: topGenres,
      };
    }),

  // Get recommendations based on a specific movie
  getSimilarMovies: protectedProcedure
    .input(idSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const { id } = input as z.infer<typeof idSchema>;

      const movie = await ctx.db.movie.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!movie) {
        return { similarMovies: [] };
      }

      // Find movies with similar genres
      const similarMovies = await ctx.db.movie.findMany({
        where: {
          userId,
          id: { not: id },
          ...(movie.genres && movie.genres.length > 0 && {
            genres: { hasSome: movie.genres },
          }),
        },
        include: {
          _count: {
            select: {
              watches: true,
            },
          },
        },
        take: 10,
      });

      return {
        similarMovies,
        basedOnMovie: {
          id: movie.id,
          title: movie.title,
          genres: movie.genres,
        },
      };
    }),
});

