import { z } from "zod";

import { API_CONFIG } from "~/config/api";
import { env } from "~/env";
import { apiClient } from "~/server/api/utils/api-client";

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
  genres: z
    .array(z.object({ id: z.number(), name: z.string() }))
    .optional()
    .default([]),
  networks: z
    .array(z.object({ id: z.number(), name: z.string() }))
    .optional()
    .default([]),
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

export type TMDBTvSearchResult = {
  id: string;
  title: string;
  overview: string;
  posterPath: string | null;
  firstAirDate: string | null;
  year: number | null;
  status: string | null;
  network: string | null;
};

export type TMDBTvSeriesDetails = {
  id: string;
  title: string;
  overview: string;
  posterPath: string | null;
  firstAirDate: string | null;
  lastAirDate: string | null;
  status: string | null;
  network: string | null;
  genres: string[];
};

export type TMDBTvSeasonSummary = {
  number: number;
  name: string | null;
  overview: string | null;
  image: string | null;
};

export type TMDBTvEpisodeSummary = {
  number: number;
  name: string | null;
  overview: string | null;
  aired: string | null;
  runtime: number | null;
  image: string | null;
};

export class TMDBTvClient {
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

  private getImageUrl(path: string | null): string | null {
    if (!path) return null;
    return `${this.imageBaseUrl}${path}`;
  }

  async search(query: string, page = 1): Promise<TMDBTvSearchResult[]> {
    const url = this.buildUrl("/search/tv", { query, page: page.toString() });
    const response = await apiClient.fetch(url, tmdbTvSearchResponseSchema);
    return response.results.map((tv) => this.formatSearchResult(tv));
  }

  async getSeries(tmdbId: string): Promise<TMDBTvSeriesDetails> {
    const series = await this.getDetails(tmdbId);
    return {
      id: series.id.toString(),
      title: series.name,
      overview: series.overview ?? "",
      posterPath: this.getImageUrl(series.poster_path ?? null),
      firstAirDate: series.first_air_date ?? null,
      lastAirDate: series.last_air_date ?? null,
      status: series.status ?? null,
      network: series.networks?.[0]?.name ?? null,
      genres: (series.genres ?? []).map((genre) => genre.name),
    };
  }

  async getSeasons(tmdbId: string): Promise<TMDBTvSeasonSummary[]> {
    const series = await this.getDetails(tmdbId);
    return (series.seasons ?? []).map((season) => ({
      number: season.season_number,
      name: season.name ?? null,
      overview: season.overview ?? null,
      image: this.getImageUrl(season.poster_path ?? null),
    }));
  }

  async getEpisodes(
    tmdbId: string,
    seasonNumber: number,
  ): Promise<TMDBTvEpisodeSummary[]> {
    const url = this.buildUrl(`/tv/${tmdbId}/season/${seasonNumber}`);
    const season = await apiClient.fetch(url, tmdbTvSeasonDetailsSchema);
    return (season.episodes ?? []).map((episode) => ({
      number: episode.episode_number,
      name: episode.name ?? null,
      overview: episode.overview ?? null,
      aired: episode.air_date ?? null,
      runtime: episode.runtime ?? null,
      image: this.getImageUrl(episode.still_path ?? null),
    }));
  }

  private async getDetails(tmdbId: string) {
    const url = this.buildUrl(`/tv/${tmdbId}`);
    return apiClient.fetch(url, tmdbTvDetailsWithSeasonsSchema);
  }

  private formatSearchResult(
    tv: z.infer<typeof tmdbTvSchema>,
  ): TMDBTvSearchResult {
    const year = tv.first_air_date
      ? Number(tv.first_air_date.slice(0, 4))
      : null;
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

export const tmdbTvClient = new TMDBTvClient(env.TMDB_API_KEY);
