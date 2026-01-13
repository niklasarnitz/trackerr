import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { env } from "~/env";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// Jellyfin webhook payload schema for playback events
const jellyfinWebhookPayloadSchema = z.object({
  Event: z.enum(["playback.stop"]),
  UserId: z.string(),
  NotificationUsername: z.string().optional(),
  Item: z
    .object({
      Name: z.string(),
      ProviderIds: z.record(z.string(), z.unknown()).optional(),
      RunTimeTicks: z.number().optional(),
    })
    .optional(),
});

type JellyfinWebhookPayload = z.infer<typeof jellyfinWebhookPayloadSchema>;

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
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
      }),
    )
    .optional(),
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
      crew: z
        .array(
          z.object({
            name: z.string(),
            job: z.string().optional(),
          }),
        )
        .optional(),
    })
    .optional(),
});

type TmdbMovieWithCredits = z.infer<typeof tmdbMovieWithCreditsSchema>;

async function getTmdbMovieWithCredits(
  tmdbId: string,
): Promise<TmdbMovieWithCredits> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key not configured");
  }

  const url = new URL(`${TMDB_BASE_URL}/movie/${tmdbId}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("append_to_response", "credits");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? "Movie not found on TMDB"
        : "Failed to fetch movie details from TMDB",
    );
  }

  const data = (await response.json()) as unknown;
  return tmdbMovieWithCreditsSchema.parse(data);
}

async function searchTMDBByTitle(
  title: string,
): Promise<{ id: string; title: string }[]> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key not configured");
  }

  const url = new URL(`${TMDB_BASE_URL}/search/movie`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("query", title);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to search TMDB");
  }

  const data = (await response.json()) as {
    results?: Array<{ id: number; title: string }>;
  };

  return (data.results ?? []).map((movie) => ({
    id: movie.id.toString(),
    title: movie.title,
  }));
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
  if (!movie.genres) return [];
  return movie.genres.map((g) => g.name);
}

export async function POST(request: NextRequest) {
  try {
    console.log("[Jellyfin Webhook] Received request");

    // Extract API key from header
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey) {
      console.log("[Jellyfin Webhook] Missing API key");
      return NextResponse.json({ error: "Missing API key" }, { status: 401 });
    }

    console.log("[Jellyfin Webhook] Validating API key...");
    // Find user with this webhook config
    const webhookConfig = await db.jellyfinWebhookConfig.findUnique({
      where: { webhookApiKey: apiKey },
      include: { userPreferences: true },
    });

    if (!webhookConfig) {
      console.log("[Jellyfin Webhook] Invalid API key - config not found");
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    console.log(
      `[Jellyfin Webhook] API key valid. User: ${webhookConfig.userPreferences.userId}`,
    );

    if (!webhookConfig.isEnabled) {
      console.log("[Jellyfin Webhook] Webhook is disabled");
      return NextResponse.json(
        { error: "Webhook is disabled" },
        { status: 403 },
      );
    }

    // Parse the request body
    console.log("[Jellyfin Webhook] Parsing request body...");
    const rawBody = await request.text();
    console.log("[Jellyfin Webhook] Raw request body:", rawBody);

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (error) {
      console.log("[Jellyfin Webhook] Failed to parse JSON body");
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Extract data from template
    const tmdbId = body.tmdbId ? parseInt(body.tmdbId, 10) : null;
    const totalRunTimeInTicks = body.totalRunTimeInTicks
      ? parseInt(body.totalRunTimeInTicks, 10)
      : 0;
    const currentRunTimeInTicks = body.currentRunTimeInTicks
      ? parseInt(body.currentRunTimeInTicks, 10)
      : 0;

    console.log(
      `[Jellyfin Webhook] TMDB ID: ${tmdbId}, Total: ${totalRunTimeInTicks}, Current: ${currentRunTimeInTicks}`,
    );

    // Check if we have TMDB ID
    if (!tmdbId) {
      console.log(
        "[Jellyfin Webhook] No TMDB ID found in webhook data - skipping",
      );
      return NextResponse.json({
        success: true,
        message: "Webhook processed but skipped - no TMDB ID available",
      });
    }

    // Check if watched at least 3/4 of the way through
    const watchPercentage =
      totalRunTimeInTicks > 0 ? currentRunTimeInTicks / totalRunTimeInTicks : 0;
    const MIN_WATCH_THRESHOLD = 0.75;

    console.log(
      `[Jellyfin Webhook] Watch percentage: ${(watchPercentage * 100).toFixed(2)}%`,
    );

    if (watchPercentage < MIN_WATCH_THRESHOLD) {
      console.log(
        `[Jellyfin Webhook] Watch percentage (${(watchPercentage * 100).toFixed(2)}%) below threshold (${MIN_WATCH_THRESHOLD * 100}%) - skipping`,
      );
      return NextResponse.json({
        success: true,
        message: `Watch percentage ${(watchPercentage * 100).toFixed(2)}% below 75% threshold`,
      });
    }

    console.log(
      "[Jellyfin Webhook] Watch meets criteria - proceeding to track movie",
    );

    // Check if movie already exists
    const userId = webhookConfig.userPreferences.userId;
    console.log(`[Jellyfin Webhook] Looking up movie with TMDB ID: ${tmdbId}`);
    let movie = await db.movie.findFirst({
      where: {
        userId,
        tmdbId: String(tmdbId),
      },
    });

    // If not, create it from TMDB
    if (!movie) {
      console.log(`[Jellyfin Webhook] Movie not found, fetching from TMDB...`);
      try {
        const tmdbData = await getTmdbMovieWithCredits(String(tmdbId));
        console.log(`[Jellyfin Webhook] Creating movie: ${tmdbData.title}`);

        movie = await db.movie.create({
          data: {
            userId,
            tmdbId: String(tmdbData.id),
            title: tmdbData.title,
            originalTitle: (tmdbData.original_title ?? "").trim() || null,
            releaseYear: mapReleaseYear(tmdbData.release_date),
            runtime: tmdbData.runtime ?? null,
            posterPath: null,
            overview: (tmdbData.overview ?? "").trim() || null,
            genres: mapGenres(tmdbData),
            director: mapDirector(tmdbData),
            cast: mapCast(tmdbData, 10),
          },
        });
        console.log(
          `[Jellyfin Webhook] Movie created successfully. ID: ${movie.id}`,
        );
      } catch (error) {
        console.error(
          "[Jellyfin Webhook] Failed to create movie from TMDB:",
          error,
        );
        return NextResponse.json(
          { error: "Failed to create movie from TMDB" },
          { status: 500 },
        );
      }
    } else {
      console.log(`[Jellyfin Webhook] Movie already exists. ID: ${movie.id}`);
    }

    // Create the watch entry
    console.log(
      `[Jellyfin Webhook] Creating watch entry for movie: ${movie.title}`,
    );
    const watch = await db.movieWatch.create({
      data: {
        movieId: movie.id,
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

    console.log(
      `[Jellyfin Webhook] Watch entry created successfully. ID: ${watch.id}`,
    );
    console.log(
      `[Jellyfin Webhook] Successfully tracked watch for "${movie.title}"`,
    );

    return NextResponse.json({
      success: true,
      message: `Watch tracked for "${movie.title}"`,
      data: {
        movieId: movie.id,
        watchId: watch.id,
        movieTitle: movie.title,
      },
    });
  } catch (error) {
    console.error("[Jellyfin Webhook] Unexpected error:", error);
    if (error instanceof Error) {
      console.error("[Jellyfin Webhook] Error message:", error.message);
      console.error("[Jellyfin Webhook] Stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
