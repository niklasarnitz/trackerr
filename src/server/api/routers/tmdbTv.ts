import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import { API_CONFIG } from "~/config/api";
import { apiClient } from "~/server/api/utils/api-client";

// Zod schemas for TMDB TV responses
const tmdbTvSchema = z.object({
  id: z.number(),
  name: z.string(),
  original_name: z.string().optional().default(""),
  first_air_date: z.string().nullable().optional().default(null),
  overview: z.string().optional().default(""),
  poster_path: z.string().nullable(),
  vote_average: z.number().nullable().optional().default(0),
  vote_count: z.number().nullable().optional().default(0),
  original_language: z.string().optional(),
  popularity: z.number().optional(),
});

const tmdbTvSearchResponseSchema = z.object({
  page: z.number(),
  results: z.array(tmdbTvSchema),
  total_pages: z.number(),
  total_results: z.number(),
});

const tmdbTvDetailsSchema = z.object({
  id: z.number(),
  name: z.string(),
  overview: z.string().optional().default(""),
  first_air_date: z.string().nullable().optional().default(null),
  last_air_date: z.string().nullable().optional().default(null),
  status: z.string().nullable().optional().default(null),
  poster_path: z.string().nullable().optional().default(null),
  genres: z.array(z.object({ id: z.number(), name: z.string() })).optional().default([]),
  networks: z.array(z.object({ id: z.number(), name: z.string() })).optional().default([]),
});

const tmdbTvSeasonSchema = z.object({
  season_number: z.number(),
  name: z.string().nullable().optional().default(null),
  overview: z.string().nullable().optional().default(null),
  poster_path: z.string().nullable().optional().default(null),
});

const tmdbTvDetailsWithSeasonsSchema = tmdbTvDetailsSchema.extend({
  seasons: z.array(tmdbTvSeasonSchema).optional().default([]),
});

const tmdbTvEpisodeSchema = z.object({
  episode_number: z.number(),
  name: z.string().nullable().optional().default(null),
  overview: z.string().nullable().optional().default(null),
  air_date: z.string().nullable().optional().default(null),
  still_path: z.string().nullable().optional().default(null),
  runtime: z.number().nullable().optional().default(null),
});

const tmdbTvSeasonDetailsSchema = z.object({
  id: z.number(),
  episodes: z.array(tmdbTvEpisodeSchema).optional().default([]),
});

class TMDBTvClient {
  private apiKey: string;
  private baseUrl = API_CONFIG.TMDB.baseUrl;
  private imageBaseUrl = API_CONFIG.TMDB.imageBaseUrl;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("TMDB API key is required");
    this.apiKey = apiKey;
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): URL {
    return apiClient.buildUrl(`${this.baseUrl}${endpoint}`, {
      api_key: this.apiKey,
      ...params,
    });
  }

  getImageUrl(path: string | null): string | null {
    if (!path) return null;
    return `${this.imageBaseUrl}${path}`;
  }

  async search(query: string, page = 1) {
    const url = this.buildUrl("/search/tv", { query, page: page.toString() });
    return apiClient.fetch(url, tmdbTvSearchResponseSchema);
  }

  async getDetails(id: string) {
    const url = this.buildUrl(`/tv/${id}`);
    return apiClient.fetch(url, tmdbTvDetailsWithSeasonsSchema);
  }

  async getSeason(id: string, seasonNumber: number) {
    const url = this.buildUrl(`/tv/${id}/season/${seasonNumber}`);
    return apiClient.fetch(url, tmdbTvSeasonDetailsSchema);
  }

  formatSearchResult(tv: z.infer<typeof tmdbTvSchema>) {
    const year = tv.first_air_date ? Number(tv.first_air_date.slice(0, 4)) : null;
    return {
      id: tv.id.toString(),
      title: tv.name,
      overview: tv.overview ?? "",
      posterPath: this.getImageUrl(tv.poster_path),
      firstAirDate: tv.first_air_date ?? null,
      year,
      status: null,
      network: null,
    };
  }
}

const tmdbTvClient = new TMDBTvClient(env.TMDB_API_KEY);

export const tmdbTvRouter = createTRPCRouter({
  // Search TV series on TMDB
  search: protectedProcedure
    .input(z.object({ query: z.string().min(1), page: z.number().min(1).default(1) }))
    .query(async ({ input }) => {
      const response = await tmdbTvClient.search(input.query, input.page);
      return {
        results: response.results.map((tv) => tmdbTvClient.formatSearchResult(tv)),
      };
    }),

  // Get TV series details from TMDB (for creation UI if needed)
  getSeries: protectedProcedure
    .input(z.object({ tmdbId: z.string() }))
    .query(async ({ input }) => {
      const series = await tmdbTvClient.getDetails(input.tmdbId);
      return {
        id: series.id.toString(),
        title: series.name,
        overview: series.overview ?? "",
        posterPath: tmdbTvClient.getImageUrl(series.poster_path ?? null),
        firstAirDate: series.first_air_date ?? null,
        lastAirDate: series.last_air_date ?? null,
        status: series.status ?? null,
        network: series.networks?.[0]?.name ?? null,
        genres: (series.genres ?? []).map((g) => g.name),
      };
    }),

  // Get seasons for a TV series
  getSeasons: protectedProcedure
    .input(z.object({ tmdbId: z.string() }))
    .query(async ({ input }) => {
      const series = await tmdbTvClient.getDetails(input.tmdbId);
      const seasons = (series.seasons ?? []).map((s) => ({
        number: s.season_number,
        name: s.name ?? null,
        overview: s.overview ?? null,
        image: tmdbTvClient.getImageUrl(s.poster_path ?? null),
      }));
      return seasons;
    }),

  // Get episodes for a given season
  getEpisodes: protectedProcedure
    .input(z.object({ tmdbId: z.string(), seasonNumber: z.number().min(0) }))
    .query(async ({ input }) => {
      const season = await tmdbTvClient.getSeason(input.tmdbId, input.seasonNumber);
      const episodes = (season.episodes ?? []).map((e) => ({
        number: e.episode_number,
        name: e.name ?? null,
        overview: e.overview ?? null,
        aired: e.air_date ?? null,
        runtime: e.runtime ?? null,
        image: tmdbTvClient.getImageUrl(e.still_path ?? null),
      }));
      return episodes;
    }),
});
