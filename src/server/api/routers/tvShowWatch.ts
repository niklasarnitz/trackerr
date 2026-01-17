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

  // Get TV show watch stats for dashboard
  getStats: protectedProcedure
    .input(
      z.object({ year: z.union([z.number(), z.literal("all")]).optional() }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const currentDate = new Date();
      const isAllTime = input.year === "all";
      const year =
        typeof input.year === "number" ? input.year : currentDate.getFullYear();
      const startOfYear = isAllTime
        ? new Date("1900-01-01")
        : new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);

      const isCurrentYear = !isAllTime && year === currentDate.getFullYear();
      const monthStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const monthEnd = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
        23,
        59,
        59,
      );

      const [
        totalWatches,
        totalShows,
        avgRating,
        showGroups,
        allWatches,
        thisMonth,
      ] = await Promise.all([
        ctx.db.tvShowWatch.count({
          where: {
            userId,
            watchedAt: {
              gte: startOfYear,
              lte: endOfYear,
            },
          },
        }),
        ctx.db.tvShow.count({
          where: { userId },
        }),
        ctx.db.tvShowWatch.aggregate({
          where: {
            userId,
            rating: { not: null },
            watchedAt: {
              gte: startOfYear,
              lte: endOfYear,
            },
          },
          _avg: { rating: true },
        }),
        ctx.db.tvShowWatch.groupBy({
          by: ["tvShowId"],
          where: {
            userId,
            watchedAt: {
              gte: startOfYear,
              lte: endOfYear,
            },
          },
        }),
        ctx.db.tvShowWatch.findMany({
          where: {
            userId,
            watchedAt: {
              gte: startOfYear,
              lte: endOfYear,
            },
          },
          select: { watchedAt: true },
        }),
        isCurrentYear
          ? ctx.db.tvShowWatch.count({
              where: {
                userId,
                watchedAt: {
                  gte: monthStart,
                  lte: monthEnd,
                },
              },
            })
          : Promise.resolve(0),
      ]);

      const monthsWithWatches = new Set<string>();
      allWatches.forEach((watch) => {
        const monthKey = `${watch.watchedAt.getFullYear()}-${String(
          watch.watchedAt.getMonth() + 1,
        ).padStart(2, "0")}`;
        monthsWithWatches.add(monthKey);
      });

      const avgPerMonth =
        monthsWithWatches.size > 0 ? totalWatches / monthsWithWatches.size : 0;

      return {
        totalWatches,
        totalShows,
        uniqueShowsWatched: showGroups.length,
        averageRating: avgRating._avg.rating,
        thisMonth: isCurrentYear ? thisMonth : 0,
        thisYear: totalWatches,
        avgPerMonth: Math.round(avgPerMonth * 10) / 10,
      };
    }),

  // Get monthly TV watch trends
  getMonthlyTrends: protectedProcedure
    .input(
      z.object({ year: z.union([z.number(), z.literal("all")]).optional() }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const currentDate = new Date();
      const isAllTime = input.year === "all";
      const year =
        typeof input.year === "number" ? input.year : currentDate.getFullYear();

      const startDate = isAllTime
        ? new Date("1900-01-01")
        : new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);

      const monthlyStats = await ctx.db.tvShowWatch.findMany({
        where: {
          userId,
          watchedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: { watchedAt: true },
      });

      const monthlyGrouped = monthlyStats.reduce(
        (acc, watch) => {
          const monthKey = `${watch.watchedAt.getFullYear()}-${String(
            watch.watchedAt.getMonth() + 1,
          ).padStart(2, "0")}`;
          acc[monthKey] = (acc[monthKey] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const months: Array<{ month: string; label: string; count: number }> = [];

      if (isAllTime) {
        const sortedMonths = Object.keys(monthlyGrouped).sort();
        sortedMonths.forEach((monthKey) => {
          const [yearStr, monthStr] = monthKey.split("-");
          const monthNum = parseInt(monthStr!) - 1;
          const date = new Date(parseInt(yearStr!), monthNum, 1);
          months.push({
            month: monthKey,
            label: date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            }),
            count: monthlyGrouped[monthKey] ?? 0,
          });
        });
      } else {
        for (let i = 0; i < 12; i++) {
          const date = new Date(year, i, 1);
          const monthKey = `${date.getFullYear()}-${String(
            date.getMonth() + 1,
          ).padStart(2, "0")}`;
          months.push({
            month: monthKey,
            label: date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            }),
            count: monthlyGrouped[monthKey] ?? 0,
          });
        }
      }

      return months;
    }),

  // Get top rated TV shows
  getTopRatedShows: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const watchesWithRatings = await ctx.db.tvShowWatch.findMany({
      where: {
        userId,
        rating: { not: null },
      },
      include: { tvShow: true },
    });

    const showRatings = watchesWithRatings.reduce(
      (acc, watch) => {
        if (!watch.rating) return acc;
        const tvShowId = watch.tvShowId;
        if (!acc[tvShowId]) {
          acc[tvShowId] = {
            tvShow: watch.tvShow,
            ratings: [],
            watchCount: 0,
          };
        }
        acc[tvShowId]!.ratings.push(watch.rating);
        acc[tvShowId]!.watchCount += 1;
        return acc;
      },
      {} as Record<
        string,
        {
          tvShow: { id: string; title: string; firstAirDate: Date | null };
          ratings: number[];
          watchCount: number;
        }
      >,
    );

    return Object.values(showRatings)
      .map((data) => ({
        tvShow: data.tvShow,
        averageRating:
          data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length,
        watchCount: data.watchCount,
      }))
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 10);
  }),

  // Get most watched TV shows
  getMostWatchedShows: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const watchGroups = await ctx.db.tvShowWatch.groupBy({
      by: ["tvShowId"],
      where: { userId },
      _count: { tvShowId: true },
      orderBy: {
        _count: {
          tvShowId: "desc",
        },
      },
      take: 10,
    });

    const tvShowIds = watchGroups.map((g) => g.tvShowId);
    const tvShows = await ctx.db.tvShow.findMany({
      where: {
        id: { in: tvShowIds },
        userId,
      },
    });

    const tvShowMap = new Map(tvShows.map((show) => [show.id, show]));

    return watchGroups
      .map((group) => {
        const tvShow = tvShowMap.get(group.tvShowId);
        if (!tvShow) return null;
        return {
          tvShow: {
            id: tvShow.id,
            title: tvShow.title,
            firstAirDate: tvShow.firstAirDate,
          },
          watchCount: group._count.tvShowId,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }),

  // Get day of week statistics
  getDayOfWeekStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const watches = await ctx.db.tvShowWatch.findMany({
      where: { userId },
      select: { watchedAt: true },
    });

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const dayGroups = watches.reduce(
      (acc, watch) => {
        const dayOfWeek = new Date(watch.watchedAt).getDay();
        const dayName = dayNames[dayOfWeek] ?? "Unknown";
        acc[dayName] = (acc[dayName] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return dayNames.map((day) => ({
      day,
      count: dayGroups[day] ?? 0,
    }));
  }),
});
