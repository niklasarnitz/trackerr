import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  tvShowSearchSchema,
  idSchema,
  tvShowTmdbIdSchema,
  tvShowCreateSchema,
  tvShowUpdateSchema,
} from "~/lib/api-schemas";
import { downloadAndUploadTvShowPoster } from "~/helpers/image-upload";
import { tmdbTvClient } from "~/server/api/utils/tmdb-tv-client";

// Helper to get TMDB TV details via shared client
async function getTmdbSeriesDetails(tmdbId: string) {
  return tmdbTvClient.getSeries(tmdbId);
}

export const tvShowRouter = createTRPCRouter({
  // Get all TV shows for current user
  getAll: protectedProcedure
    .input(tvShowSearchSchema)
    .query(async ({ ctx, input }) => {
      // For "watched" sorting, do it manually
      if (input.sort === "watched") {
        const allTvShows = await ctx.db.tvShow.findMany({
          where: {
            userId: ctx.session.user.id,
            ...(input.search && {
              OR: [
                { title: { contains: input.search, mode: "insensitive" } },
                {
                  originalTitle: {
                    contains: input.search,
                    mode: "insensitive",
                  },
                },
              ],
            }),
            ...(input.watchlist && { isInWatchlist: true }),
            ...(input.favorites && { isFavorite: true }),
          },
          include: {
            watches: {
              orderBy: { watchedAt: "desc" },
              take: 1,
            },
            _count: {
              select: {
                watches: true,
              },
            },
          },
        });

        // Sort by latest watch date
        const sortedTvShows = [...allTvShows];
        sortedTvShows.sort((a, b) => {
          const aLastWatch = a.watches[0]?.watchedAt;
          const bLastWatch = b.watches[0]?.watchedAt;
          if (!aLastWatch && !bLastWatch) return 0;
          if (!aLastWatch) return 1;
          if (!bLastWatch) return -1;
          return (
            new Date(bLastWatch).getTime() - new Date(aLastWatch).getTime()
          );
        });

        // Apply pagination manually
        const tvShows = sortedTvShows.slice(
          input.skip,
          input.skip + input.limit,
        );
        const total = allTvShows.length;

        return {
          tvShows,
          total,
          hasMore: input.skip + input.limit < total,
        };
      }

      // For other sorting options, use Prisma's orderBy
      let orderBy;
      switch (input.sort) {
        case "created":
          orderBy = { createdAt: "desc" as const };
          break;
        case "title":
        default:
          orderBy = { title: "asc" as const };
          break;
      }

      const tvShows = await ctx.db.tvShow.findMany({
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
          watches: {
            orderBy: { watchedAt: "desc" },
            take: 1,
          },
          _count: {
            select: {
              watches: true,
            },
          },
        },
        orderBy,
        skip: input.skip,
        take: input.limit,
      });

      const total = await ctx.db.tvShow.count({
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
        tvShows,
        total,
        hasMore: input.skip + input.limit < total,
      };
    }),

  // Get single TV show by ID
  getById: protectedProcedure.input(idSchema).query(async ({ ctx, input }) => {
    const tvShow = await ctx.db.tvShow.findFirst({
      where: {
        id: input.id,
        userId: ctx.session.user.id,
      },
      include: {
        seasons: {
          orderBy: { seasonNumber: "asc" },
          include: {
            episodes: {
              orderBy: { episodeNumber: "asc" },
              include: {
                watches: {
                  where: { userId: ctx.session.user.id },
                  orderBy: { watchedAt: "desc" },
                  take: 1,
                },
              },
            },
          },
        },
        watches: {
          orderBy: { watchedAt: "desc" },
          include: {
            episode: {
              include: {
                season: true,
              },
            },
          },
        },
        tvShowTags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            watches: true,
          },
        },
      },
    });

    if (!tvShow) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "TV show not found",
      });
    }

    return tvShow;
  }),

  // Get single TV show by TMDB ID
  getByTmdbId: protectedProcedure
    .input(tvShowTmdbIdSchema)
    .query(async ({ ctx, input }) => {
      const tvShow = await ctx.db.tvShow.findFirst({
        where: {
          tmdbId: input.tmdbId,
          userId: ctx.session.user.id,
        },
        include: {
          seasons: {
            orderBy: { seasonNumber: "asc" },
          },
          watches: {
            orderBy: { watchedAt: "desc" },
          },
          _count: {
            select: {
              watches: true,
            },
          },
        },
      });

      if (!tvShow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "TV show not found in your collection",
        });
      }

      return tvShow;
    }),

  // Create TV show from TMDB
  create: protectedProcedure
    .input(tvShowCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if TV show already exists for this user
      const existingTvShow = await ctx.db.tvShow.findUnique({
        where: {
          userId_tmdbId: {
            userId: ctx.session.user.id,
            tmdbId: input.tmdbId,
          },
        },
      });

      if (existingTvShow) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "TV show already exists in your collection",
        });
      }

      let tmdb;
      try {
        tmdb = await getTmdbSeriesDetails(input.tmdbId);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch TV show metadata from TMDB",
          cause: error,
        });
      }

      // Create TV show first to get the ID
      const tvShow = await ctx.db.tvShow.create({
        data: {
          userId: ctx.session.user.id,
          tmdbId: input.tmdbId,
          title: tmdb.title,
          originalTitle: null,
          firstAirDate: tmdb.firstAirDate ? new Date(tmdb.firstAirDate) : null,
          lastAirDate: tmdb.lastAirDate ? new Date(tmdb.lastAirDate) : null,
          status: tmdb.status ?? null,
          posterPath: null, // Will be updated after upload
          overview: tmdb.overview ?? null,
          genres: tmdb.genres ?? [],
          network: tmdb.network ?? null,
          cast: [],
        },
      });

      // Download and upload poster to Minio if available
      if (tmdb.posterPath) {
        try {
          const { url, blurDataUrl } = await downloadAndUploadTvShowPoster(
            tvShow.id,
            tmdb.posterPath,
          );
          await ctx.db.tvShow.update({
            where: { id: tvShow.id },
            data: {
              posterPath: url,
              blurDataUrl,
            },
          });
        } catch (error) {
          console.error("Failed to upload poster to Minio:", error);
          // Keep the TV show but without poster - don't fail the whole operation
        }
      }

      // Sync seasons and episodes from TMDB upon creation
      try {
        if (!tvShow.tmdbId) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "TMDB ID missing for TV show",
          });
        }
        const seasons = await tmdbTvClient.getSeasons(tvShow.tmdbId);

        for (const season of seasons) {
          // Skip season 0 (specials) for now
          if (season.number === 0) continue;

          const dbSeason = await ctx.db.tvShowSeason.upsert({
            where: {
              tvShowId_seasonNumber: {
                tvShowId: tvShow.id,
                seasonNumber: season.number,
              },
            },
            create: {
              tvShowId: tvShow.id,
              seasonNumber: season.number,
              name: season.name ?? `Season ${season.number}`,
              overview: season.overview ?? null,
              posterPath: season.image ?? null,
            },
            update: {
              name: season.name ?? `Season ${season.number}`,
              overview: season.overview ?? null,
              posterPath: season.image ?? null,
            },
          });

          const episodes = await tmdbTvClient.getEpisodes(
            tvShow.tmdbId,
            season.number,
          );

          for (const episode of episodes) {
            await ctx.db.tvShowEpisode.upsert({
              where: {
                seasonId_episodeNumber: {
                  seasonId: dbSeason.id,
                  episodeNumber: episode.number,
                },
              },
              create: {
                seasonId: dbSeason.id,
                episodeNumber: episode.number,
                name: episode.name ?? `Episode ${episode.number}`,
                overview: episode.overview ?? null,
                airDate: episode.aired ? new Date(episode.aired) : null,
                runtime: episode.runtime ?? null,
                stillPath: episode.image ?? null,
              },
              update: {
                name: episode.name ?? `Episode ${episode.number}`,
                overview: episode.overview ?? null,
                airDate: episode.aired ? new Date(episode.aired) : null,
                runtime: episode.runtime ?? null,
                stillPath: episode.image ?? null,
              },
            });
          }
        }
      } catch (error) {
        console.error("Failed to sync seasons/episodes on creation:", error);
        // Do not fail the creation; user can trigger manual sync later
      }

      return tvShow;
    }),

  // Update TV show
  update: protectedProcedure
    .input(tvShowUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const tvShow = await ctx.db.tvShow.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!tvShow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "TV show not found",
        });
      }

      return ctx.db.tvShow.update({
        where: { id: input.id },
        data: {
          ...(input.notes !== undefined && { notes: input.notes }),
          ...(input.isInWatchlist !== undefined && {
            isInWatchlist: input.isInWatchlist,
          }),
          ...(input.isFavorite !== undefined && {
            isFavorite: input.isFavorite,
          }),
        },
      });
    }),

  // Delete TV show
  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const tvShow = await ctx.db.tvShow.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!tvShow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "TV show not found",
        });
      }

      await ctx.db.tvShow.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Toggle watchlist
  toggleWatchlist: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const tvShow = await ctx.db.tvShow.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!tvShow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "TV show not found",
        });
      }

      return ctx.db.tvShow.update({
        where: { id: input.id },
        data: {
          isInWatchlist: !tvShow.isInWatchlist,
        },
      });
    }),

  // Toggle favorite
  toggleFavorite: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const tvShow = await ctx.db.tvShow.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!tvShow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "TV show not found",
        });
      }

      return ctx.db.tvShow.update({
        where: { id: input.id },
        data: {
          isFavorite: !tvShow.isFavorite,
        },
      });
    }),

  // Sync seasons and episodes from TMDB
  syncSeasonsAndEpisodes: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tvShow = await ctx.db.tvShow.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!tvShow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "TV show not found",
        });
      }

      try {
        if (!tvShow.tmdbId) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "TMDB ID missing for TV show",
          });
        }
        const tmdbId = tvShow.tmdbId;
        const seasons = await tmdbTvClient.getSeasons(tmdbId);

        // Filter seasons first
        const validSeasons = seasons.filter((s) => s.number !== 0);

        // Parallelize fetching episodes for all seasons
        const episodesPromises = validSeasons.map((season) =>
          tmdbTvClient
            .getEpisodes(tmdbId, season.number)
            .then((episodes) => ({ seasonNumber: season.number, episodes })),
        );

        // Parallelize upserting seasons to get DB IDs
        const dbSeasonsPromises = validSeasons.map((season) =>
          ctx.db.tvShowSeason.upsert({
            where: {
              tvShowId_seasonNumber: {
                tvShowId: tvShow.id,
                seasonNumber: season.number,
              },
            },
            create: {
              tvShowId: tvShow.id,
              seasonNumber: season.number,
              name: season.name ?? `Season ${season.number}`,
              overview: season.overview ?? null,
              posterPath: season.image ?? null,
            },
            update: {
              name: season.name ?? `Season ${season.number}`,
              overview: season.overview ?? null,
              posterPath: season.image ?? null,
            },
          }),
        );

        // Wait for both seasons DB upserts and episodes fetching
        const [episodesResults, dbSeasons] = await Promise.all([
          Promise.all(episodesPromises),
          Promise.all(dbSeasonsPromises),
        ]);

        // Map season number to DB season ID for quick lookup
        const seasonIdMap = new Map<number, string>();
        for (const dbSeason of dbSeasons) {
          seasonIdMap.set(dbSeason.seasonNumber, dbSeason.id);
        }

        // Parallelize episode upserts
        const episodeUpsertPromises = [];

        for (const { seasonNumber, episodes } of episodesResults) {
          const seasonId = seasonIdMap.get(seasonNumber);
          if (!seasonId) continue; // Should not happen

          for (const episode of episodes) {
            episodeUpsertPromises.push(
              ctx.db.tvShowEpisode.upsert({
                where: {
                  seasonId_episodeNumber: {
                    seasonId: seasonId,
                    episodeNumber: episode.number,
                  },
                },
                create: {
                  seasonId: seasonId,
                  episodeNumber: episode.number,
                  name: episode.name ?? `Episode ${episode.number}`,
                  overview: episode.overview ?? null,
                  airDate: episode.aired ? new Date(episode.aired) : null,
                  runtime: episode.runtime ?? null,
                  stillPath: episode.image ?? null,
                },
                update: {
                  name: episode.name ?? `Episode ${episode.number}`,
                  overview: episode.overview ?? null,
                  airDate: episode.aired ? new Date(episode.aired) : null,
                  runtime: episode.runtime ?? null,
                  stillPath: episode.image ?? null,
                },
              }),
            );
          }
        }

        await Promise.all(episodeUpsertPromises);
      } catch (error) {
        console.error("Failed to sync seasons/episodes:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sync seasons/episodes",
        });
      }

      return { success: true };
    }),
});
