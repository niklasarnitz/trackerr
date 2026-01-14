import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  tvShowSearchSchema,
  idSchema,
  tvdbIdSchema,
  tvShowCreateSchema,
  tvShowUpdateSchema,
} from "~/lib/api-schemas";
import { downloadAndUploadTvShowPoster } from "~/helpers/image-upload";
import { getTVDBClient } from "~/server/api/routers/tvdb";

// Get TVDB series extended details
async function getTvdbSeriesExtended(tvdbId: string) {
  const client = getTVDBClient();
  return client.getSeriesExtended(tvdbId);
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

  // Get single TV show by TVDB ID
  getByTvdbId: protectedProcedure
    .input(tvdbIdSchema)
    .query(async ({ ctx, input }) => {
      const tvShow = await ctx.db.tvShow.findFirst({
        where: {
          tvdbId: input.tvdbId,
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

  // Create TV show from TVDB
  create: protectedProcedure
    .input(tvShowCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if TV show already exists for this user
      const existingTvShow = await ctx.db.tvShow.findUnique({
        where: {
          userId_tvdbId: {
            userId: ctx.session.user.id,
            tvdbId: input.tvdbId,
          },
        },
      });

      if (existingTvShow) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "TV show already exists in your collection",
        });
      }

      let tvdb;
      try {
        tvdb = await getTvdbSeriesExtended(input.tvdbId);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch TV show metadata from TVDB",
          cause: error,
        });
      }

      // Create TV show first to get the ID
      const tvShow = await ctx.db.tvShow.create({
        data: {
          userId: ctx.session.user.id,
          tvdbId: input.tvdbId,
          title: tvdb.name,
          originalTitle: tvdb.name !== tvdb.name ? tvdb.name : null,
          firstAirDate: tvdb.firstAired ? new Date(tvdb.firstAired) : null,
          lastAirDate: tvdb.lastAired ? new Date(tvdb.lastAired) : null,
          status: tvdb.status?.name ?? null,
          posterPath: null, // Will be updated after upload
          overview: tvdb.overview ?? null,
          genres: tvdb.genres.map((g) => g.name) ?? [],
          network: tvdb.originalNetwork?.name ?? null,
          cast: tvdb.characters
            .map((c) => c.personName ?? c.name)
            .filter((name): name is string => !!name)
            .slice(0, 10),
        },
      });

      // Download and upload poster to Minio if available
      if (tvdb.image) {
        try {
          const { url, blurDataUrl } = await downloadAndUploadTvShowPoster(
            tvShow.id,
            tvdb.image,
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

      // Sync seasons and episodes from TVDB upon creation
      try {
        const client = getTVDBClient();
        const seasons = await client.getSeasons(tvShow.tvdbId);

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

          const episodes = await client.getEpisodes(
            tvShow.tvdbId,
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

  // Sync seasons and episodes from TVDB
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
        const client = getTVDBClient();
        const seasons = await client.getSeasons(tvShow.tvdbId);

        for (const season of seasons) {
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

          const episodes = await client.getEpisodes(
            tvShow.tvdbId,
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
        console.error("Failed to sync seasons/episodes:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sync seasons/episodes",
        });
      }

      return { success: true };
    }),
});
