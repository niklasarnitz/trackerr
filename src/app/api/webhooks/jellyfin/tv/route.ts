// Mock TMDB API
// Since I can't easily mock fetch in the server process from here without modifying code or setting up a proxy.
// I will just modify the code to log the URL and return fake data if TMDB_API_KEY is "mock-tmdb-key".

import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { env } from "~/env";
import { z } from "zod";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = env.TMDB_API_KEY;

// TMDB TV Show Schema
const tmdbTvShowSchema = z.object({
  id: z.number(),
  name: z.string(),
  original_name: z.string().nullable().optional(),
  first_air_date: z.string().nullable().optional(),
  last_air_date: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  overview: z.string().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  genres: z
    .array(z.object({ id: z.number(), name: z.string() }))
    .optional(),
  networks: z.array(z.object({ name: z.string() })).optional(),
  credits: z
    .object({
      cast: z
        .array(
          z.object({
            name: z.string(),
            order: z.number().optional(),
          }),
        )
        .optional(),
    })
    .optional(),
});

type TmdbTvShow = z.infer<typeof tmdbTvShowSchema>;

// TMDB TV Season Schema
const tmdbTvSeasonSchema = z.object({
  id: z.number(),
  season_number: z.number(),
  name: z.string(),
  overview: z.string().nullable().optional(),
  air_date: z.string().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  episodes: z
    .array(
      z.object({
        id: z.number(),
        episode_number: z.number(),
        name: z.string(),
        overview: z.string().nullable().optional(),
        air_date: z.string().nullable().optional(),
        runtime: z.number().nullable().optional(),
        still_path: z.string().nullable().optional(),
      }),
    )
    .optional(),
});

type TmdbTvSeason = z.infer<typeof tmdbTvSeasonSchema>;

async function getTmdbTvShow(tmdbId: string): Promise<TmdbTvShow> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key not configured");
  }

  const url = new URL(`${TMDB_BASE_URL}/tv/${tmdbId}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("append_to_response", "credits");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? "TV Show not found on TMDB"
        : "Failed to fetch TV show details from TMDB",
    );
  }

  const data = (await response.json()) as unknown;
  return tmdbTvShowSchema.parse(data);
}

async function getTmdbTvSeason(
  tmdbId: string,
  seasonNumber: number,
): Promise<TmdbTvSeason> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key not configured");
  }

  const url = new URL(
    `${TMDB_BASE_URL}/tv/${tmdbId}/season/${seasonNumber}`,
  );
  url.searchParams.set("api_key", TMDB_API_KEY);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? "TV Season not found on TMDB"
        : "Failed to fetch TV season details from TMDB",
    );
  }

  const data = (await response.json()) as unknown;
  return tmdbTvSeasonSchema.parse(data);
}

function parseDate(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

function mapCast(show: TmdbTvShow, limit = 10): string[] {
  const cast = show.credits?.cast ?? [];
  return cast
    .slice()
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
    .map((c) => c.name)
    .filter((n) => n.trim() !== "")
    .slice(0, limit);
}

export async function POST(request: NextRequest) {
  try {
    console.log("[Jellyfin TV Webhook] Received request");

    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 401 });
    }

    const webhookConfig = await db.jellyfinWebhookConfig.findUnique({
      where: { webhookApiKey: apiKey },
      include: { userPreferences: true },
    });

    if (!webhookConfig) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    if (!webhookConfig.isEnabled) {
      return NextResponse.json(
        { error: "Webhook is disabled" },
        { status: 403 },
      );
    }

    const rawBody = await request.text();
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (error) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const rawTmdbId = body.tmdbId ? parseInt(body.tmdbId, 10) : null;
    const tmdbId = rawTmdbId && !isNaN(rawTmdbId) ? rawTmdbId : null;

    const rawSeasonNumber = body.seasonNumber
      ? parseInt(body.seasonNumber, 10)
      : null;
    const seasonNumber =
      rawSeasonNumber !== null && !isNaN(rawSeasonNumber)
        ? rawSeasonNumber
        : null;

    const rawEpisodeNumber = body.episodeNumber
      ? parseInt(body.episodeNumber, 10)
      : null;
    const episodeNumber =
      rawEpisodeNumber !== null && !isNaN(rawEpisodeNumber)
        ? rawEpisodeNumber
        : null;

    const totalRunTimeInTicks = body.totalRunTimeInTicks
      ? parseInt(body.totalRunTimeInTicks, 10)
      : 0;
    const currentRunTimeInTicks = body.currentRunTimeInTicks
      ? parseInt(body.currentRunTimeInTicks, 10)
      : 0;

    if (!tmdbId || seasonNumber === null || episodeNumber === null) {
      console.log(
        "[Jellyfin TV Webhook] Missing required fields (tmdbId, seasonNumber, episodeNumber)",
      );
      return NextResponse.json({
        success: true,
        message: "Webhook processed but skipped - missing required fields",
      });
    }

    const watchPercentage =
      totalRunTimeInTicks > 0 ? currentRunTimeInTicks / totalRunTimeInTicks : 0;
    const MIN_WATCH_THRESHOLD = 0.75;

    if (watchPercentage < MIN_WATCH_THRESHOLD) {
      console.log(
        `[Jellyfin TV Webhook] Watch percentage (${(watchPercentage * 100).toFixed(
          2,
        )}%) below threshold`,
      );
      return NextResponse.json({
        success: true,
        message: `Watch percentage below threshold`,
      });
    }

    const userId = webhookConfig.userPreferences.userId;

    // 1. Ensure TvShow exists
    let tvShow = await db.tvShow.findUnique({
      where: {
        userId_tmdbId: {
          userId,
          tmdbId: String(tmdbId),
        },
      },
    });

    if (!tvShow) {
      console.log(
        `[Jellyfin TV Webhook] TV Show not found, fetching from TMDB: ${tmdbId}`,
      );
      const tmdbShow = await getTmdbTvShow(String(tmdbId));

      tvShow = await db.tvShow.create({
        data: {
          userId,
          tmdbId: String(tmdbShow.id),
          title: tmdbShow.name,
          originalTitle: tmdbShow.original_name ?? null,
          firstAirDate: parseDate(tmdbShow.first_air_date),
          lastAirDate: parseDate(tmdbShow.last_air_date),
          status: tmdbShow.status ?? null,
          overview: tmdbShow.overview ?? null,
          posterPath: tmdbShow.poster_path ?? null,
          genres: tmdbShow.genres?.map((g) => g.name) ?? [],
          network: tmdbShow.networks?.[0]?.name ?? null,
          cast: mapCast(tmdbShow),
        },
      });
    }

    // 2. Ensure TvShowSeason exists
    let season = await db.tvShowSeason.findUnique({
      where: {
        tvShowId_seasonNumber: {
          tvShowId: tvShow.id,
          seasonNumber,
        },
      },
      include: { episodes: true },
    });

    if (!season) {
      console.log(
        `[Jellyfin TV Webhook] Season ${seasonNumber} not found, fetching from TMDB`,
      );
      const tmdbSeason = await getTmdbTvSeason(String(tmdbId), seasonNumber);

      season = await db.tvShowSeason.create({
        data: {
          tvShowId: tvShow.id,
          seasonNumber: tmdbSeason.season_number,
          name: tmdbSeason.name,
          overview: tmdbSeason.overview,
          airDate: parseDate(tmdbSeason.air_date),
          posterPath: tmdbSeason.poster_path,
          episodeCount: tmdbSeason.episodes?.length ?? 0,
          episodes: {
            create: tmdbSeason.episodes?.map((ep) => ({
              episodeNumber: ep.episode_number,
              name: ep.name,
              overview: ep.overview,
              airDate: parseDate(ep.air_date),
              runtime: ep.runtime,
              stillPath: ep.still_path,
            })),
          },
        },
        include: { episodes: true },
      });
    }

    // 3. Ensure TvShowEpisode exists (should exist if season created, but handle new eps)
    let episode = season.episodes.find(
      (e) => e.episodeNumber === episodeNumber,
    );

    if (!episode) {
      console.log(
        `[Jellyfin TV Webhook] Episode ${episodeNumber} not found in local DB, refreshing season`,
      );
      // Re-fetch season to get new episodes
      const tmdbSeason = await getTmdbTvSeason(String(tmdbId), seasonNumber);
      const tmdbEpisode = tmdbSeason.episodes?.find(
        (e) => e.episode_number === episodeNumber,
      );

      if (tmdbEpisode) {
        episode = await db.tvShowEpisode.create({
          data: {
            seasonId: season.id,
            episodeNumber: tmdbEpisode.episode_number,
            name: tmdbEpisode.name,
            overview: tmdbEpisode.overview,
            airDate: parseDate(tmdbEpisode.air_date),
            runtime: tmdbEpisode.runtime,
            stillPath: tmdbEpisode.still_path,
          },
        });
      } else {
         console.log(
          `[Jellyfin TV Webhook] Episode ${episodeNumber} not found in TMDB`,
        );
        // Fallback: Create minimal episode entry? Or fail?
        // Let's create a minimal entry so we can track the watch
        episode = await db.tvShowEpisode.create({
            data: {
                seasonId: season.id,
                episodeNumber: episodeNumber,
            }
        });
      }
    }

    // 4. Create TvShowWatch
    console.log(`[Jellyfin TV Webhook] Creating watch for ${tvShow.title} S${seasonNumber}E${episodeNumber}`);
    const watch = await db.tvShowWatch.create({
      data: {
        tvShowId: tvShow.id,
        episodeId: episode.id,
        userId,
        watchedAt: new Date(),
        watchLocation: "ON_DEMAND",
        streamingService: "HOME_MEDIA_LIBRARY",
        externalActionMetadataTags: {
          create: {
            via: "WEBHOOK",
            from: "JELLYFIN",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Watch tracked for "${tvShow.title}" S${seasonNumber}E${episodeNumber}`,
      data: {
        tvShowId: tvShow.id,
        seasonId: season.id,
        episodeId: episode.id,
        watchId: watch.id,
      },
    });
  } catch (error) {
    console.error("[Jellyfin TV Webhook] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
