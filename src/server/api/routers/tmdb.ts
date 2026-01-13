import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";

// TMDB API integration
const TMDB_API_KEY = env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// Helper to construct full TMDB image URL
function getTmdbImageUrl(posterPath: string | null): string | null {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
}

let tmdbGenresCache: {
  readonly fetchedAtMs: number;
  readonly genres: Array<{ id: number; name: string }>;
} | null = null;

let tmdbGenresInFlight: Promise<Array<{ id: number; name: string }>> | null =
  null;

const TMDB_GENRES_TTL_MS = 1000 * 60 * 60 * 24; // 24h

// Zod schemas for TMDB API responses
const tmdbMovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  original_title: z.string(),
  release_date: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  overview: z.string().optional().default(""),
  vote_average: z.number().nullable().optional().default(0),
  vote_count: z.number().nullable().optional().default(0),
  adult: z.boolean().optional(),
  genre_ids: z.array(z.number()).optional(),
  original_language: z.string().optional(),
  popularity: z.number().optional(),
  video: z.boolean().optional(),
});

const tmdbSearchResponseSchema = z.object({
  page: z.number(),
  results: z.array(tmdbMovieSchema),
  total_pages: z.number(),
  total_results: z.number(),
});

type TMDBMovie = z.infer<typeof tmdbMovieSchema>;
type TMDBSearchResponse = z.infer<typeof tmdbSearchResponseSchema>;

async function searchTMDB(
  query: string,
  page = 1,
): Promise<TMDBSearchResponse> {
  if (!TMDB_API_KEY) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "TMDB API key not configured",
    });
  }

  const url = new URL(`${TMDB_BASE_URL}/search/movie`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("query", query);
  url.searchParams.set("page", page.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to search TMDB",
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = await response.json();

  try {
    return tmdbSearchResponseSchema.parse(data);
  } catch (error) {
    console.error(
      "TMDB API response validation failed:",
      error,
      "\noriginal data: \n",
      data,
    );
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Invalid response from TMDB API",
    });
  }
}

async function getTMDBMovie(id: string): Promise<TMDBMovie> {
  if (!TMDB_API_KEY) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "TMDB API key not configured",
    });
  }

  const url = new URL(`${TMDB_BASE_URL}/movie/${id}`);
  url.searchParams.set("api_key", TMDB_API_KEY);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Movie not found on TMDB",
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = await response.json();

  try {
    return tmdbMovieSchema.parse(data);
  } catch (error) {
    console.error("TMDB API response validation failed:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Invalid response from TMDB API",
    });
  }
}

async function getTMDBMovieDetails(id: string) {
  if (!TMDB_API_KEY) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "TMDB API key not configured",
    });
  }

  const url = new URL(`${TMDB_BASE_URL}/movie/${id}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("append_to_response", "credits,genres");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Movie not found on TMDB",
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  return await response.json();
}

async function getTMDBGenres() {
  if (!TMDB_API_KEY) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "TMDB API key not configured",
    });
  }

  const url = new URL(`${TMDB_BASE_URL}/genre/movie/list`);
  url.searchParams.set("api_key", TMDB_API_KEY);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch genres from TMDB",
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = await response.json();
  return data.genres as Array<{ id: number; name: string }>;
}

async function getTMDBGenresCached() {
  const now = Date.now();
  if (
    tmdbGenresCache &&
    now - tmdbGenresCache.fetchedAtMs < TMDB_GENRES_TTL_MS
  ) {
    return tmdbGenresCache.genres;
  }

  if (tmdbGenresInFlight) {
    return await tmdbGenresInFlight;
  }

  tmdbGenresInFlight = (async () => {
    const genres = await getTMDBGenres();
    tmdbGenresCache = { fetchedAtMs: Date.now(), genres };
    return genres;
  })();

  try {
    return await tmdbGenresInFlight;
  } finally {
    tmdbGenresInFlight = null;
  }
}

export const tmdbRouter = createTRPCRouter({
  // Search movies on TMDB
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        page: z.number().min(1).default(1),
      }),
    )
    .query(async ({ input }) => {
      const results = await searchTMDB(input.query, input.page);

      return {
        ...results,
        results: results.results.map((movie) => ({
          id: movie.id.toString(),
          title: movie.title,
          originalTitle: movie.original_title,
          releaseYear:
            movie.release_date && movie.release_date.trim() !== ""
              ? new Date(movie.release_date).getFullYear()
              : null,
          posterPath: getTmdbImageUrl(movie.poster_path),
          overview: movie.overview,
          voteAverage: movie.vote_average,
          voteCount: movie.vote_count,
        })),
      };
    }),

  // Get movie details from TMDB
  getMovie: protectedProcedure
    .input(z.object({ tmdbId: z.string() }))
    .query(async ({ input }) => {
      const movie = await getTMDBMovie(input.tmdbId);
      const details = await getTMDBMovieDetails(input.tmdbId);

      // Extract director and main cast
      const director =
        details.credits?.crew?.find(
          (person: { job: string }) => person.job === "Director",
        )?.name ?? null;
      const cast =
        details.credits?.cast
          ?.slice(0, 5)
          .map((actor: { name: string }) => actor.name) ?? [];

      // Extract genre names
      const genres =
        details.genres?.map((genre: { name: string }) => genre.name) ?? [];

      return {
        id: movie.id.toString(),
        title: movie.title,
        originalTitle: movie.original_title,
        releaseYear:
          movie.release_date && movie.release_date.trim() !== ""
            ? new Date(movie.release_date).getFullYear()
            : null,
        runtime: details.runtime ?? null,
        posterPath: getTmdbImageUrl(movie.poster_path),
        overview: movie.overview,
        voteAverage: movie.vote_average,
        voteCount: movie.vote_count,
        genres,
        director,
        cast,
      };
    }),

  // Get all genres
  getGenres: protectedProcedure.query(async () => {
    return await getTMDBGenresCached();
  }),

  // Search and add movie to collection
  searchAndAdd: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        page: z.number().min(1).default(1),
        includedInCollection: z.boolean().default(true), // Show which movies are already in collection
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await searchTMDB(input.query, input.page);

      // Get user's existing movies if requested
      let existingMoviesMap = new Map<string, string>();
      if (input.includedInCollection) {
        const userMovies = await ctx.db.movie.findMany({
          where: { userId: ctx.session.user.id },
          select: { id: true, tmdbId: true },
        });
        existingMoviesMap = new Map(userMovies.map((m) => [m.tmdbId, m.id]));
      }

      // Get genre names for each movie
      const genreMap = new Map<number, string>();
      try {
        const genres = await getTMDBGenresCached();
        genres.forEach((genre) => {
          genreMap.set(genre.id, genre.name);
        });
      } catch {
        // If genre fetch fails, continue without genres
      }

      const sortedResults = [...results.results].sort((a, b) => {
        const aPopularity = a.popularity ?? 0;
        const bPopularity = b.popularity ?? 0;
        if (aPopularity !== bPopularity) return bPopularity - aPopularity;

        const aVoteCount = a.vote_count ?? 0;
        const bVoteCount = b.vote_count ?? 0;
        if (aVoteCount !== bVoteCount) return bVoteCount - aVoteCount;

        const aVoteAverage = a.vote_average ?? 0;
        const bVoteAverage = b.vote_average ?? 0;
        return bVoteAverage - aVoteAverage;
      });

      return {
        ...results,
        results: sortedResults.map((movie) => ({
          id: movie.id.toString(),
          title: movie.title,
          originalTitle: movie.original_title,
          releaseYear:
            movie.release_date && movie.release_date.trim() !== ""
              ? new Date(movie.release_date).getFullYear()
              : null,
          posterPath: getTmdbImageUrl(movie.poster_path),
          overview: movie.overview,
          voteAverage: movie.vote_average,
          voteCount: movie.vote_count,
          popularity: movie.popularity ?? 0,
          genres:
            movie.genre_ids
              ?.map((id) => genreMap.get(id) ?? "")
              .filter(Boolean) ?? [],
          inCollection: existingMoviesMap.has(movie.id.toString()),
          movieId: existingMoviesMap.get(movie.id.toString()) ?? null,
        })),
      };
    }),

  // Get recommendations from TMDB
  getRecommendations: protectedProcedure
    .input(z.object({ tmdbId: z.string(), page: z.number().min(1).default(1) }))
    .query(async ({ input }) => {
      if (!TMDB_API_KEY) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "TMDB API key not configured",
        });
      }

      const url = new URL(
        `${TMDB_BASE_URL}/movie/${input.tmdbId}/recommendations`,
      );
      url.searchParams.set("api_key", TMDB_API_KEY);
      url.searchParams.set("page", input.page.toString());

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get recommendations from TMDB",
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await response.json();

      return {
        page: data.page ?? 1,
        totalPages: data.total_pages ?? 1,
        totalResults: data.total_results ?? 0,
        results: (data.results ?? []).map((movie: any) => ({
          id: movie.id.toString(),
          title: movie.title,
          originalTitle: movie.original_title,
          releaseYear:
            movie.release_date && movie.release_date.trim() !== ""
              ? new Date(movie.release_date).getFullYear()
              : null,
          posterPath: getTmdbImageUrl(movie.poster_path),
          overview: movie.overview,
          voteAverage: movie.vote_average,
        })),
      };
    }),
});
