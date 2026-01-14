import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  idSchema,
  tvShowWatchCreateSchema,
  tvShowWatchUpdateSchema,
} from "~/lib/api-schemas";

export const tvShowWatchRouter = createTRPCRouter({
  // Get all watches for a TV show
  getByTvShowId: protectedProcedure
    .input(
      z.object({
        tvShowId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const watches = await ctx.db.tvShowWatch.findMany({
        where: {
          tvShowId: input.tvShowId,
          userId: ctx.session.user.id,
        },
        include: {
          episode: {
            include: {
              season: true,
            },
          },
        },
        orderBy: { watchedAt: "desc" },
      });

      return watches;
    }),

  // Get all watches for a specific episode
  getByEpisodeId: protectedProcedure
    .input(
      z.object({
        episodeId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const watches = await ctx.db.tvShowWatch.findMany({
        where: {
          episodeId: input.episodeId,
          userId: ctx.session.user.id,
        },
        include: {
          tvShow: true,
          episode: {
            include: {
              season: true,
            },
          },
        },
        orderBy: { watchedAt: "desc" },
      });

      return watches;
    }),

  // Get all watches for current user
  getAll: protectedProcedure
    .input(
      z.object({
        skip: z.number().min(0).default(0),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = {
        userId: ctx.session.user.id,
        ...(input.search && {
          tvShow: {
            OR: [
              {
                title: { contains: input.search, mode: "insensitive" as const },
              },
              {
                originalTitle: {
                  contains: input.search,
                  mode: "insensitive" as const,
                },
              },
            ],
          },
        }),
      };

      const watches = await ctx.db.tvShowWatch.findMany({
        where,
        include: {
          tvShow: true,
          episode: {
            include: {
              season: true,
            },
          },
        },
        orderBy: { watchedAt: "desc" },
        skip: input.skip,
        take: input.limit,
      });

      const total = await ctx.db.tvShowWatch.count({ where });

      return {
        watches,
        total,
        hasMore: input.skip + input.limit < total,
      };
    }),

  // Get single watch by ID
  getById: protectedProcedure.input(idSchema).query(async ({ ctx, input }) => {
    const watch = await ctx.db.tvShowWatch.findFirst({
      where: {
        id: input.id,
        userId: ctx.session.user.id,
      },
      include: {
        tvShow: true,
        episode: {
          include: {
            season: true,
          },
        },
      },
    });

    if (!watch) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Watch entry not found",
      });
    }

    return watch;
  }),

  // Create watch entry
  create: protectedProcedure
    .input(tvShowWatchCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify TV show exists and belongs to user
      const tvShow = await ctx.db.tvShow.findFirst({
        where: {
          id: input.tvShowId,
          userId: ctx.session.user.id,
        },
      });

      if (!tvShow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "TV show not found",
        });
      }

      // If episode ID is provided, verify it exists and belongs to the TV show
      if (input.episodeId) {
        const episode = await ctx.db.tvShowEpisode.findFirst({
          where: {
            id: input.episodeId,
            season: {
              tvShowId: input.tvShowId,
            },
          },
        });

        if (!episode) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Episode not found",
          });
        }
      }

      return ctx.db.tvShowWatch.create({
        data: {
          tvShowId: input.tvShowId,
          episodeId: input.episodeId ?? null,
          userId: ctx.session.user.id,
          watchedAt: input.watchedAt ?? new Date(),
          rating: input.rating ?? null,
          review: input.review ?? null,
          watchLocation: input.watchLocation,
          streamingService: input.streamingService ?? null,
        },
        include: {
          tvShow: true,
          episode: {
            include: {
              season: true,
            },
          },
        },
      });
    }),

  // Update watch entry
  update: protectedProcedure
    .input(tvShowWatchUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const watch = await ctx.db.tvShowWatch.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!watch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Watch entry not found",
        });
      }

      return ctx.db.tvShowWatch.update({
        where: { id: input.id },
        data: {
          ...(input.watchedAt !== undefined && { watchedAt: input.watchedAt }),
          ...(input.rating !== undefined && { rating: input.rating }),
          ...(input.review !== undefined && { review: input.review }),
          ...(input.watchLocation !== undefined && {
            watchLocation: input.watchLocation,
          }),
          ...(input.streamingService !== undefined && {
            streamingService: input.streamingService,
          }),
        },
        include: {
          tvShow: true,
          episode: {
            include: {
              season: true,
            },
          },
        },
      });
    }),

  // Delete watch entry
  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const watch = await ctx.db.tvShowWatch.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!watch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Watch entry not found",
        });
      }

      await ctx.db.tvShowWatch.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get watch statistics for a TV show
  getStatistics: protectedProcedure
    .input(
      z.object({
        tvShowId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tvShow = await ctx.db.tvShow.findFirst({
        where: {
          id: input.tvShowId,
          userId: ctx.session.user.id,
        },
        include: {
          watches: {
            where: {
              userId: ctx.session.user.id,
            },
          },
          seasons: {
            include: {
              episodes: {
                include: {
                  watches: {
                    where: {
                      userId: ctx.session.user.id,
                    },
                  },
                },
              },
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

      // Calculate total episodes
      const totalEpisodes = tvShow.seasons.reduce(
        (sum, season) => sum + season.episodes.length,
        0,
      );

      // Calculate watched episodes (unique episodes)
      const watchedEpisodeIds = new Set(
        tvShow.watches
          .filter((w) => w.episodeId)
          .map((w) => w.episodeId as string),
      );
      const watchedEpisodes = watchedEpisodeIds.size;

      // Calculate average rating
      const ratingsOnly = tvShow.watches
        .map((w) => w.rating)
        .filter((r): r is number => r !== null);
      const averageRating =
        ratingsOnly.length > 0
          ? ratingsOnly.reduce((sum, r) => sum + r, 0) / ratingsOnly.length
          : null;

      return {
        totalWatches: tvShow.watches.length,
        totalEpisodes,
        watchedEpisodes,
        progress:
          totalEpisodes > 0
            ? Math.round((watchedEpisodes / totalEpisodes) * 100)
            : 0,
        averageRating,
        lastWatchedAt: tvShow.watches[0]?.watchedAt ?? null,
      };
    }),
});
