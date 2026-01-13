import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import { API_CONFIG } from "~/config/api";
import { apiClient } from "~/server/api/utils/api-client";
import { CachedAsyncFunction } from "~/server/api/utils/cache";

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

const tmdbGenreSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const tmdbGenresResponseSchema = z.object({
  genres: z.array(tmdbGenreSchema),
});

type TMDBMovie = z.infer<typeof tmdbMovieSchema>;
type TMDBSearchResponse = z.infer<typeof tmdbSearchResponseSchema>;
type TMDBGenre = z.infer<typeof tmdbGenreSchema>;

/**
 * TMDB Client - Handles all TMDB API interactions with unified logic
 */
class TMDBClient {
  private apiKey: string;
  private baseUrl = API_CONFIG.TMDB.baseUrl;
  private imageBaseUrl = API_CONFIG.TMDB.imageBaseUrl;
  private genresCache: CachedAsyncFunction<TMDBGenre[]>;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("TMDB API key is required");
    }
    this.apiKey = apiKey;

    // Initialize genres cache
    this.genresCache = new CachedAsyncFunction(
      API_CONFIG.TMDB.genresCacheTtlMs,
      () => this.fetchGenres(),
    );
  }

  /**
   * Get full TMDB image URL from poster path
   */
  getTmdbImageUrl(posterPath: string | null): string | null {
    if (!posterPath) return null;
    return `${this.imageBaseUrl}${posterPath}`;
  }

  /**
   * Build TMDB API URL with authentication
   */
  private buildUrl(endpoint: string, params?: Record<string, string>): URL {
    return apiClient.buildUrl(`${this.baseUrl}${endpoint}`, {
      api_key: this.apiKey,
      ...params,
    });
  }

  /**
   * Search for movies on TMDB
   */
  async search(query: string, page = 1): Promise<TMDBSearchResponse> {
    const url = this.buildUrl("/search/movie", {
      query,
      page: page.toString(),
    });
    return apiClient.fetch(url, tmdbSearchResponseSchema);
  }

  /**
   * Get movie by ID
   */
  async getMovie(id: string): Promise<TMDBMovie> {
    const url = this.buildUrl(`/movie/${id}`);
    return apiClient.fetch(url, tmdbMovieSchema);
  }

  /**
   * Get movie details (includes credits and genres)
   */
  async getMovieDetails(id: string): Promise<Record<string, unknown>> {
    const url = this.buildUrl(`/movie/${id}`, {
      append_to_response: "credits,genres",
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return apiClient.fetch(url, z.record(z.string(), z.unknown()));
  }

  /**
   * Get all genres (cached)
   */
  async getGenres(): Promise<TMDBGenre[]> {
    return this.genresCache.get();
  }

  /**
   * Fetch genres from TMDB API
   */
  private async fetchGenres(): Promise<TMDBGenre[]> {
    const url = this.buildUrl("/genre/movie/list");
    const response = await apiClient.fetch(url, tmdbGenresResponseSchema);
    return response.genres;
  }

  /**
   * Get movie recommendations
   */
  async getRecommendations(id: string, page = 1): Promise<TMDBSearchResponse> {
    const url = this.buildUrl(`/movie/${id}/recommendations`, {
      page: page.toString(),
    });
    return apiClient.fetch(url, tmdbSearchResponseSchema);
  }

  /**
   * Format movie data for client response
   */
  formatMovie(movie: TMDBMovie) {
    return {
      id: movie.id.toString(),
      title: movie.title,
      originalTitle: movie.original_title,
      releaseYear:
        movie.release_date && movie.release_date.trim() !== ""
          ? new Date(movie.release_date).getFullYear()
          : null,
      posterPath: this.getTmdbImageUrl(movie.poster_path),
      overview: movie.overview,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
    };
  }
}

// Initialize TMDB client
const tmdbClient = new TMDBClient(env.TMDB_API_KEY);

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
      const results = await tmdbClient.search(input.query, input.page);

      return {
        ...results,
        results: results.results.map((movie) => tmdbClient.formatMovie(movie)),
      };
    }),

  // Get movie details from TMDB
  getMovie: protectedProcedure
    .input(z.object({ tmdbId: z.string() }))
    .query(async ({ input }) => {
      const movie = await tmdbClient.getMovie(input.tmdbId);
      const details = await tmdbClient.getMovieDetails(input.tmdbId);

      // Extract director and main cast
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const director =
        (details.credits as any)?.crew?.find(
          (person: { job: string }) => person.job === "Director",
        )?.name ?? null;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const cast =
        (details.credits as any)?.cast
          ?.slice(0, 5)
          .map((actor: { name: string }) => actor.name) ?? [];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const genres =
        (details.genres as any)?.map((genre: { name: string }) => genre.name) ??
        [];

      return {
        ...tmdbClient.formatMovie(movie),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        runtime: (details.runtime as number | undefined) ?? null,
        genres,
        director,
        cast,
      };
    }),

  // Get all genres
  getGenres: protectedProcedure.query(async () => {
    return await tmdbClient.getGenres();
  }),

  // Search and add movie to collection
  searchAndAdd: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        page: z.number().min(1).default(1),
        includedInCollection: z.boolean().default(true),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await tmdbClient.search(input.query, input.page);

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
        const genres = await tmdbClient.getGenres();
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
          ...tmdbClient.formatMovie(movie),
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
      const results = await tmdbClient.getRecommendations(
        input.tmdbId,
        input.page,
      );

      return {
        page: results.page,
        totalPages: results.total_pages,
        totalResults: results.total_results,
        results: results.results.map((movie) => tmdbClient.formatMovie(movie)),
      };
    }),
});
