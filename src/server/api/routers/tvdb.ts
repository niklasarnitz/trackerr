import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import { API_CONFIG } from "~/config/api";
import { apiClient } from "~/server/api/utils/api-client";
import { TRPCError } from "@trpc/server";

// Zod schemas for TVDB API responses
const tvdbSeriesSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string().optional(),
  overview: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  firstAired: z.string().optional().nullable(),
  lastAired: z.string().optional().nullable(),
  status: z
    .object({
      name: z.string().optional(),
    })
    .optional()
    .nullable(),
  originalNetwork: z
    .object({
      name: z.string().optional(),
    })
    .optional()
    .nullable(),
  year: z.string().optional().nullable(),
});

const tvdbSearchResponseSchema = z.object({
  status: z.string(),
  data: z
    .array(
      z.object({
        tvdb_id: z.string().optional(),
        id: z.string().optional(),
        objectID: z.string(),
        name: z.string(),
        overview: z.string().optional().nullable(),
        image_url: z.string().optional().nullable(),
        thumbnail: z.string().optional().nullable(),
        first_air_time: z.string().optional().nullable(),
        status: z.string().optional().nullable(),
        network: z.string().optional().nullable(),
        primary_type: z.string().optional(),
        year: z.string().optional().nullable(),
      }),
    )
    .optional()
    .default([]),
});

const tvdbSeriesExtendedSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string().optional(),
  overview: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  firstAired: z.string().optional().nullable(),
  lastAired: z.string().optional().nullable(),
  status: z
    .object({
      name: z.string().optional(),
    })
    .optional()
    .nullable(),
  originalNetwork: z
    .object({
      name: z.string().optional(),
    })
    .optional()
    .nullable(),
  year: z.string().optional().nullable(),
  genres: z
    .array(
      z.object({
        name: z.string(),
      }),
    )
    .optional()
    .default([]),
  characters: z
    .array(
      z.object({
        name: z.string().optional(),
        personName: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
  seasons: z
    .array(
      z.object({
        id: z.number(),
        seriesId: z.number().optional(),
        number: z.number(),
        name: z.string().optional().nullable(),
        overview: z.string().optional().nullable(),
        image: z.string().optional().nullable(),
        imageType: z.number().optional().nullable(),
        year: z.string().optional().nullable(),
      }),
    )
    .optional()
    .default([]),
});

const tvdbSeasonSchema = z.object({
  id: z.number(),
  seriesId: z.number().optional(),
  number: z.number(),
  name: z.string().optional().nullable(),
  overview: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  imageType: z.number().optional().nullable(),
  year: z.string().optional().nullable(),
});

const tvdbEpisodeSchema = z.object({
  id: z.number(),
  seriesId: z.number().optional(),
  seasonNumber: z.number().optional(),
  number: z.number(),
  name: z.string().optional().nullable(),
  overview: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  aired: z.string().optional().nullable(),
  runtime: z.number().optional().nullable(),
});

type TVDBSeries = z.infer<typeof tvdbSeriesSchema>;
type TVDBSearchResponse = z.infer<typeof tvdbSearchResponseSchema>;
type TVDBSeriesExtended = z.infer<typeof tvdbSeriesExtendedSchema>;
type TVDBSeason = z.infer<typeof tvdbSeasonSchema>;
type TVDBEpisode = z.infer<typeof tvdbEpisodeSchema>;

/**
 * TVDB Client - Handles all TVDB API v4 interactions
 */
export class TVDBClient {
  private apiKey: string;
  private baseUrl = "https://api4.thetvdb.com/v4";
  private token: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("TVDB API key is required");
    }
    this.apiKey = apiKey;
  }

  /**
   * Authenticate with TVDB API and get access token
   */
  private async authenticate(): Promise<string> {
    // Return cached token if still valid
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apikey: this.apiKey,
      }),
    });

    if (!response.ok) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to authenticate with TVDB",
      });
    }

    const data = (await response.json()) as {
      status: string;
      data: { token: string };
    };
    this.token = data.data.token;
    // Token expires in 1 month, cache for 29 days
    this.tokenExpiry = Date.now() + 29 * 24 * 60 * 60 * 1000;

    return this.token;
  }

  /**
   * Build authenticated headers for API requests
   */
  private async getHeaders(): Promise<HeadersInit> {
    const token = await this.authenticate();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Search for TV series on TVDB
   */
  async search(query: string): Promise<TVDBSearchResponse> {
    const headers = await this.getHeaders();
    const url = new URL(`${this.baseUrl}/search`);
    url.searchParams.set("query", query);
    url.searchParams.set("type", "series");

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to search TVDB",
      });
    }

    const data = (await response.json()) as unknown;
    return tvdbSearchResponseSchema.parse(data);
  }

  /**
   * Get series by ID (basic info)
   */
  async getSeries(id: string): Promise<TVDBSeries> {
    const headers = await this.getHeaders();
    const url = `${this.baseUrl}/series/${id}`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new TRPCError({
        code: response.status === 404 ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        message:
          response.status === 404
            ? "Series not found on TVDB"
            : "Failed to fetch series from TVDB",
      });
    }

    const data = (await response.json()) as { status: string; data: unknown };
    return tvdbSeriesSchema.parse(data.data);
  }

  /**
   * Get series extended details (includes genres, cast)
   */
  async getSeriesExtended(id: string): Promise<TVDBSeriesExtended> {
    const headers = await this.getHeaders();
    const url = `${this.baseUrl}/series/${id}/extended`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new TRPCError({
        code: response.status === 404 ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        message:
          response.status === 404
            ? "Series not found on TVDB"
            : "Failed to fetch series details from TVDB",
      });
    }

    const data = (await response.json()) as { status: string; data: unknown };
    return tvdbSeriesExtendedSchema.parse(data.data);
  }

  /**
   * Get all seasons for a series
   */
  async getSeasons(seriesId: string): Promise<TVDBSeason[]> {
    // Seasons are available in the extended endpoint
    const seriesExtended = await this.getSeriesExtended(seriesId);

    // Map the seasons from extended to the expected TVDBSeason format
    return seriesExtended.seasons.map((season) => ({
      id: season.id,
      seriesId: season.seriesId,
      number: season.number,
      name: season.name ?? null,
      overview: season.overview ?? null,
      image: season.image ?? null,
      imageType: season.imageType ?? null,
      year: season.year ?? null,
    }));
  }

  /**
   * Get episodes for a season
   */
  async getEpisodes(
    seriesId: string,
    seasonNumber: number,
  ): Promise<TVDBEpisode[]> {
    const headers = await this.getHeaders();
    // Page through episodes for the specified season
    let page = 0;
    const collected: unknown[] = [];

    while (true) {
      const url = `${this.baseUrl}/series/${seriesId}/episodes/default?page=${page}&season=${seasonNumber}`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch episodes from TVDB",
        });
      }

      const data = (await response.json()) as {
        status: string;
        data: { episodes: unknown[] };
      };

      const episodes = data.data.episodes ?? [];
      if (episodes.length === 0) break;

      collected.push(...episodes);
      page += 1;
    }

    return z.array(tvdbEpisodeSchema).parse(collected);
  }

  /**
   * Format series data for client response
   */
  formatSeries(series: TVDBSeries) {
    return {
      id: series.id.toString(),
      title: series.name,
      overview: series.overview ?? "",
      posterPath: series.image ?? null,
      firstAirDate: series.firstAired ?? null,
      year: series.year ?? null,
      status: series.status?.name ?? null,
      network: series.originalNetwork?.name ?? null,
    };
  }
}

// Create singleton instance
let tvdbClient: TVDBClient | null = null;

export function getTVDBClient(): TVDBClient {
  if (!tvdbClient) {
    const apiKey = env.TVDB_API_KEY;
    if (!apiKey) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "TVDB API key not configured",
      });
    }
    tvdbClient = new TVDBClient(apiKey);
  }
  return tvdbClient;
}

export const tvdbRouter = createTRPCRouter({
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      const client = getTVDBClient();
      const response = await client.search(input.query);

      return {
        results: response.data.map((series) => ({
          id: series.tvdb_id ?? series.id ?? series.objectID,
          title: series.name,
          overview: series.overview ?? "",
          posterPath: series.image_url ?? series.thumbnail ?? null,
          firstAirDate: series.first_air_time ?? null,
          year: series.year ?? null,
          status: series.status ?? null,
          network: series.network ?? null,
        })),
      };
    }),

  getSeries: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const client = getTVDBClient();
      const series = await client.getSeriesExtended(input.id);

      return {
        id: series.id.toString(),
        title: series.name,
        overview: series.overview ?? "",
        posterPath: series.image ?? null,
        firstAirDate: series.firstAired ?? null,
        lastAirDate: series.lastAired ?? null,
        year: series.year ?? null,
        status: series.status?.name ?? null,
        network: series.originalNetwork?.name ?? null,
        genres: series.genres.map((g) => g.name),
        cast: series.characters
          .map((c) => c.personName ?? c.name)
          .filter((name): name is string => !!name)
          .slice(0, 10),
      };
    }),

  getSeasons: protectedProcedure
    .input(
      z.object({
        seriesId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const client = getTVDBClient();
      const seasons = await client.getSeasons(input.seriesId);

      return seasons.map((season) => ({
        id: season.id.toString(),
        seasonNumber: season.number,
        name: season.name ?? `Season ${season.number}`,
        overview: season.overview ?? null,
        posterPath: season.image ?? null,
      }));
    }),

  getEpisodes: protectedProcedure
    .input(
      z.object({
        seriesId: z.string(),
        seasonNumber: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const client = getTVDBClient();
      const episodes = await client.getEpisodes(
        input.seriesId,
        input.seasonNumber,
      );

      return episodes.map((episode) => ({
        id: episode.id.toString(),
        episodeNumber: episode.number,
        name: episode.name ?? `Episode ${episode.number}`,
        overview: episode.overview ?? null,
        airDate: episode.aired ?? null,
        runtime: episode.runtime ?? null,
        stillPath: episode.image ?? null,
      }));
    }),
});
