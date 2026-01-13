import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  movieIdSchema,
  idSchema,
  movieWatchCreateSchema,
  movieWatchGetAllSchema,
  movieWatchUpdateSchema,
  cinemaSearchSchema,
} from "~/lib/api-schemas";
import {
  SOUND_SYSTEM_TYPES,
  PROJECTION_TYPES,
  LANGUAGE_TYPES,
  ASPECT_RATIOS,
  STREAMING_SERVICES,
} from "~/lib/form-schemas";
import {
  normalizeWatchDate,
  utcStartOfYear,
  utcEndOfYear,
  normalizeWatchDateOrToday,
} from "~/lib/watch-date";

export const movieWatchRouter = createTRPCRouter({
  // Get all watches for a movie
  getByMovieId: protectedProcedure
    .input(movieIdSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.movieWatch.findMany({
        where: {
          movieId: input.movieId,
          userId: ctx.session.user.id,
        },
        include: {
          cinemaWatchMetadata: true,
          externalActionMetadataTags: true,
        },
        orderBy: { watchedAt: "desc" },
      });
    }),

  // Create new watch entry
  create: protectedProcedure
    .input(movieWatchCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify the movie belongs to the user
      const movie = await ctx.db.movie.findFirst({
        where: {
          id: input.movieId,
          userId: ctx.session.user.id,
        },
      });

      if (!movie) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Movie not found",
        });
      }

      const { cinemaMetadata, ...watchData } = input;

      const watchedAt = normalizeWatchDateOrToday(input.watchedAt);

      return await ctx.db.movieWatch.create({
        data: {
          ...watchData,
          cinemaWatchMetadata:
            cinemaMetadata &&
            Object.values(cinemaMetadata).some(
              (value) => value !== undefined && value !== null,
            )
              ? {
                  create: cinemaMetadata,
                }
              : undefined,
          userId: ctx.session.user.id,
          watchedAt,
        },
      });
    }),

  // Update watch entry
  update: protectedProcedure
    .input(movieWatchUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, cinemaMetadata, ...updateData } = input;

      if (updateData.watchedAt) {
        updateData.watchedAt = normalizeWatchDate(updateData.watchedAt);
      }

      const movieWatch = await ctx.db.movieWatch.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });

      if (!movieWatch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Watch entry not found",
        });
      }

      // Update the movie watch first
      const updatedMovieWatch = await ctx.db.movieWatch.update({
        where: { id },
        data: updateData,
      });

      // Handle cinema metadata updates
      if (updateData.watchLocation === "CINEMA" && cinemaMetadata) {
        const hasMetadata = Object.values(cinemaMetadata).some(
          (value) => value !== undefined && value !== null,
        );

        if (hasMetadata) {
          // Check if cinema metadata already exists
          const existingCinemaMetadata =
            await ctx.db.cinemaWatchMetadata.findUnique({
              where: { movieWatchId: id },
            });

          if (existingCinemaMetadata) {
            // Update existing cinema metadata
            await ctx.db.cinemaWatchMetadata.update({
              where: { movieWatchId: id },
              data: cinemaMetadata,
            });
          } else {
            // Create new cinema metadata
            await ctx.db.cinemaWatchMetadata.create({
              data: {
                movieWatchId: id,
                ...cinemaMetadata,
              },
            });
          }
        }
      } else if (
        updateData.watchLocation &&
        updateData.watchLocation !== "CINEMA"
      ) {
        // If watch location is changed from cinema to something else, delete cinema metadata
        await ctx.db.cinemaWatchMetadata.deleteMany({
          where: { movieWatchId: id },
        });
      }

      return updatedMovieWatch;
    }),

  // Delete watch entry
  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const movieWatch = await ctx.db.movieWatch.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!movieWatch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Watch entry not found",
        });
      }

      return await ctx.db.movieWatch.delete({
        where: { id: input.id },
      });
    }),

  // Get recent watches for dashboard
  getRecent: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.movieWatch.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        movie: true,
        externalActionMetadataTags: true,
      },
      orderBy: { watchedAt: "desc" },
      take: 6, // Limit for dashboard
    });
  }),

  // Get all watch entries for user with pagination
  getAll: protectedProcedure
    .input(movieWatchGetAllSchema)
    .query(async ({ ctx, input }) => {
      const where = {
        userId: ctx.session.user.id,
        ...(input.search && {
          OR: [
            {
              movie: {
                title: {
                  contains: input.search,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              movie: {
                originalTitle: {
                  contains: input.search,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              review: {
                contains: input.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }),
        ...(input.rating === "unrated" && { rating: null }),
        ...(input.rating !== "all" &&
          input.rating !== "unrated" && {
            rating: { gte: Number(input.rating) },
          }),
      };

      const watches = await ctx.db.movieWatch.findMany({
        where,
        include: {
          movie: true,
        },
        orderBy: { watchedAt: "desc" },
        skip: input.skip,
        take: input.limit,
      });

      const total = await ctx.db.movieWatch.count({
        where,
      });

      return {
        watches,
        total,
        hasMore: input.skip + input.limit < total,
      };
    }),

  // Get watch stats
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
        : utcStartOfYear(year);
      const endOfYear = utcEndOfYear(year);

      const [
        totalWatches,
        totalMovies,
        physicalMovies,
        avgRating,
        moviesWatched,
        allWatches,
      ] = await Promise.all([
        ctx.db.movieWatch.count({
          where: {
            userId,
            watchedAt: {
              gte: startOfYear,
              lte: endOfYear,
            },
          },
        }),
        ctx.db.movie.count({
          where: {
            userId,
          },
        }),
        ctx.db.movie.count({
          where: {
            userId,
            mediaEntries: {
              some: {
                isVirtual: false,
              },
            },
          },
        }),
        ctx.db.movieWatch.aggregate({
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
        ctx.db.movieWatch.groupBy({
          by: ["movieId"],
          where: {
            userId,
            watchedAt: {
              gte: startOfYear,
              lte: endOfYear,
            },
          },
        }),
        ctx.db.movieWatch.findMany({
          where: {
            userId,
            watchedAt: {
              gte: startOfYear,
              lte: endOfYear,
            },
          },
          select: { watchedAt: true },
        }),
      ]);

      // Calculate average per month
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
        totalMovies,
        physicalMovies,
        averageRating: avgRating._avg.rating,
        uniqueMoviesWatched: moviesWatched.length,
        thisMonth: 0, // Not applicable for historical years
        thisYear: totalWatches,
        avgPerMonth: Math.round(avgPerMonth * 10) / 10,
      };
    }),

  // Get watch location distribution for charts
  getWatchLocationStats: protectedProcedure
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
        : utcStartOfYear(year);
      const endOfYear = utcEndOfYear(year);

      const locationStats = await ctx.db.movieWatch.groupBy({
        by: ["watchLocation"],
        where: {
          userId,
          watchedAt: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
        _count: {
          watchLocation: true,
        },
      });

      return locationStats.map((stat) => ({
        location: stat.watchLocation,
        count: stat._count.watchLocation,
        label: {
          ON_DEMAND: "On Demand / Streaming",
          CINEMA: "Cinema",
          TV: "TV",
          OTHER: "Other",
        }[stat.watchLocation],
      }));
    }),

  // Get rating distribution for charts
  getRatingDistribution: protectedProcedure
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
        : utcStartOfYear(year);
      const endOfYear = utcEndOfYear(year);

      const ratingStats = await ctx.db.movieWatch.groupBy({
        by: ["rating"],
        where: {
          userId,
          rating: { not: null },
          watchedAt: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
        _count: {
          rating: true,
        },
        orderBy: {
          rating: "asc",
        },
      });

      return ratingStats.map((stat) => ({
        rating: stat.rating!,
        count: stat._count.rating,
        label: `${stat.rating}★`,
      }));
    }),

  // Get monthly watch trends
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

      const monthlyStats = await ctx.db.movieWatch.findMany({
        where: {
          userId,
          watchedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          watchedAt: true,
        },
      });

      // Group by month
      const monthlyGrouped = monthlyStats.reduce(
        (acc, watch) => {
          const monthKey = `${watch.watchedAt.getFullYear()}-${String(watch.watchedAt.getMonth() + 1).padStart(2, "0")}`;
          acc[monthKey] = (acc[monthKey] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Generate all months based on isAllTime
      const months = [];

      if (isAllTime) {
        // For all time, generate months in order from earliest to latest
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
        // For specific year, generate all 12 months
        for (let i = 0; i < 12; i++) {
          const date = new Date(year, i, 1);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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
  // Search for cinemas based on user input (case-insensitive)
  searchCinemas: protectedProcedure
    .input(cinemaSearchSchema)
    .query(async ({ ctx, input }) => {
      const cinemas = await ctx.db.cinemaWatchMetadata.findMany({
        where: {
          movieWatch: {
            userId: ctx.session.user.id,
          },
          cinemaName: {
            contains: input.search,
            mode: "insensitive",
          },
        },
        select: {
          cinemaName: true,
        },
        distinct: ["cinemaName"],
        take: 10,
      });

      return cinemas
        .filter((cinema) => cinema.cinemaName)
        .map((cinema) => cinema.cinemaName!);
    }),

  // Get top 5 most frequently used cinemas for the user
  getTopCinemas: protectedProcedure.query(async ({ ctx }) => {
    const cinemaGroups = await ctx.db.cinemaWatchMetadata.groupBy({
      by: ["cinemaName"],
      where: {
        movieWatch: {
          userId: ctx.session.user.id,
        },
        cinemaName: {
          not: null,
        },
      },
      _count: {
        cinemaName: true,
      },
      orderBy: {
        _count: {
          cinemaName: "desc",
        },
      },
      take: 5,
    });

    return cinemaGroups
      .filter((group) => group.cinemaName)
      .map((group) => ({
        name: group.cinemaName!,
        count: group._count.cinemaName,
      }));
  }),

  // Cinema statistics for dashboard
  getCinemaStats: protectedProcedure.query(async ({ ctx }) => {
    const cinemaGroups = await ctx.db.cinemaWatchMetadata.groupBy({
      by: ["cinemaName"],
      where: {
        movieWatch: {
          userId: ctx.session.user.id,
        },
        cinemaName: {
          not: null,
        },
      },
      _count: {
        cinemaName: true,
      },
      orderBy: {
        _count: {
          cinemaName: "desc",
        },
      },
    });

    return cinemaGroups
      .filter((group) => group.cinemaName)
      .map((group) => ({
        label: group.cinemaName!,
        count: group._count.cinemaName,
      }));
  }),

  getSoundSystemStats: protectedProcedure.query(async ({ ctx }) => {
    const soundSystemGroups = await ctx.db.cinemaWatchMetadata.groupBy({
      by: ["soundSystemType"],
      where: {
        movieWatch: {
          userId: ctx.session.user.id,
        },
        soundSystemType: {
          not: null,
        },
      },
      _count: {
        soundSystemType: true,
      },
      orderBy: {
        _count: {
          soundSystemType: "desc",
        },
      },
    });

    return soundSystemGroups
      .filter((group) => group.soundSystemType)
      .map((group) => {
        const soundSystemType = group.soundSystemType!;
        return {
          label:
            SOUND_SYSTEM_TYPES[soundSystemType] ??
            soundSystemType.replace(/_/g, " "),
          count: group._count.soundSystemType,
        };
      });
  }),

  getProjectionTypeStats: protectedProcedure.query(async ({ ctx }) => {
    const projectionGroups = await ctx.db.cinemaWatchMetadata.groupBy({
      by: ["projectionType"],
      where: {
        movieWatch: {
          userId: ctx.session.user.id,
        },
        projectionType: {
          not: null,
        },
      },
      _count: {
        projectionType: true,
      },
      orderBy: {
        _count: {
          projectionType: "desc",
        },
      },
    });

    return projectionGroups
      .filter((group) => group.projectionType)
      .map((group) => {
        const projectionType = group.projectionType!;
        return {
          label:
            PROJECTION_TYPES[projectionType] ??
            projectionType.replace(/_/g, " "),
          count: group._count.projectionType,
        };
      });
  }),

  getLanguageTypeStats: protectedProcedure.query(async ({ ctx }) => {
    const languageGroups = await ctx.db.cinemaWatchMetadata.groupBy({
      by: ["languageType"],
      where: {
        movieWatch: {
          userId: ctx.session.user.id,
        },
        languageType: {
          not: null,
        },
      },
      _count: {
        languageType: true,
      },
      orderBy: {
        _count: {
          languageType: "desc",
        },
      },
    });

    return languageGroups
      .filter((group) => group.languageType)
      .map((group) => {
        const languageType = group.languageType!;
        return {
          label:
            LANGUAGE_TYPES[languageType] ?? languageType.replace(/_/g, " "),
          count: group._count.languageType,
        };
      });
  }),

  getAspectRatioStats: protectedProcedure.query(async ({ ctx }) => {
    const aspectRatioGroups = await ctx.db.cinemaWatchMetadata.groupBy({
      by: ["aspectRatio"],
      where: {
        movieWatch: {
          userId: ctx.session.user.id,
        },
        aspectRatio: {
          not: null,
        },
      },
      _count: {
        aspectRatio: true,
      },
      orderBy: {
        _count: {
          aspectRatio: "desc",
        },
      },
    });

    return aspectRatioGroups
      .filter((group) => group.aspectRatio)
      .map((group) => {
        const aspectRatio = group.aspectRatio!;
        return {
          label:
            ASPECT_RATIOS[aspectRatio] ?? aspectRatio.replace(/_/g, " "),
          count: group._count.aspectRatio,
        };
      });
  }),

  getCinemaTicketPriceStats: protectedProcedure.query(async ({ ctx }) => {
    // Get all ticket prices
    const ticketPrices = await ctx.db.cinemaWatchMetadata.findMany({
      where: {
        movieWatch: {
          userId: ctx.session.user.id,
        },
        ticketPrice: {
          not: null,
        },
      },
      select: {
        ticketPrice: true,
        cinemaName: true,
        movieWatch: {
          select: {
            watchedAt: true,
          },
        },
      },
    });

    const currentYear = new Date().getFullYear();
    const currentYearPrices = ticketPrices.filter(
      (price) =>
        new Date(price.movieWatch.watchedAt).getFullYear() === currentYear,
    );

    const totalSpent = currentYearPrices.reduce(
      (sum, price) => sum + (price.ticketPrice ?? 0),
      0,
    );

    const meanTicketPrice =
      currentYearPrices.length > 0 ? totalSpent / currentYearPrices.length : 0;

    // Calculate mean price per cinema
    const cinemaGroups = currentYearPrices.reduce(
      (acc, price) => {
        if (!price.cinemaName || !price.ticketPrice) return acc;

        acc[price.cinemaName] ??= [];
        acc[price.cinemaName]!.push(price.ticketPrice);
        return acc;
      },
      {} as Record<string, number[]>,
    );

    const meanPricePerCinema = Object.entries(cinemaGroups).map(
      ([cinema, prices]) => ({
        cinema,
        meanPrice:
          prices.reduce((sum, price) => sum + price, 0) / prices.length,
        ticketCount: prices.length,
      }),
    );

    return {
      totalSpentThisYear: totalSpent,
      meanTicketPrice,
      meanPricePerCinema,
      ticketCount: currentYearPrices.length,
    };
  }),

  // Get streaming service distribution for charts
  getStreamingServiceStats: protectedProcedure
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

      const streamingStats = await ctx.db.movieWatch.groupBy({
        by: ["streamingService"],
        where: {
          userId,
          watchLocation: "ON_DEMAND",
          streamingService: { not: null },
          watchedAt: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
        _count: {
          streamingService: true,
        },
        orderBy: {
          _count: {
            streamingService: "desc",
          },
        },
      });

      return streamingStats
        .filter((stat) => stat.streamingService)
        .map((stat) => {
          const service = stat.streamingService!;
          return {
            service,
            count: stat._count.streamingService,
            label: STREAMING_SERVICES[service] ?? service.replace(/_/g, " "),
          };
        });
    }),

  getMostWatchedGenres: protectedProcedure
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

      // Get all watched movies with their genres
      const watchedMovies = await ctx.db.movieWatch.findMany({
        where: {
          userId,
          watchedAt: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
        select: {
          movie: {
            select: {
              genres: true,
            },
          },
        },
      });

      // Aggregate genres
      const genreCount: Record<string, number> = {};
      watchedMovies.forEach((watch) => {
        watch.movie.genres.forEach((genre) => {
          genreCount[genre] = (genreCount[genre] ?? 0) + 1;
        });
      });

      // Sort by count and return all genres
      const allGenres = Object.entries(genreCount)
        .map(([genre, count]) => ({
          genre,
          count,
          label: genre,
        }))
        .sort((a, b) => b.count - a.count);

      return allGenres;
    }),

  getMonthlySpendingStats: protectedProcedure.query(async ({ ctx }) => {
    const currentYear = new Date().getFullYear();

    const monthlySpending = await ctx.db.cinemaWatchMetadata.findMany({
      where: {
        movieWatch: {
          userId: ctx.session.user.id,
          watchedAt: {
            gte: new Date(`${currentYear}-01-01`),
            lt: new Date(`${currentYear + 1}-01-01`),
          },
        },
        ticketPrice: {
          not: null,
        },
      },
      select: {
        ticketPrice: true,
        movieWatch: {
          select: {
            watchedAt: true,
          },
        },
      },
    });

    // Group by month
    const monthlyGroups = monthlySpending.reduce(
      (acc, price) => {
        const month = new Date(price.movieWatch.watchedAt).getMonth();
        const monthKey = new Date(currentYear, month).toLocaleString(
          "default",
          { month: "short" },
        );

        acc[monthKey] ??= 0;
        acc[monthKey] += price.ticketPrice ?? 0;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Ensure all months are represented
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return months.map((month) => ({
      label: month,
      amount: monthlyGroups[month] ?? 0,
    }));
  }),

  // Get top rated movies
  getTopRatedMovies: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const watchesWithRatings = await ctx.db.movieWatch.findMany({
      where: {
        userId,
        rating: { not: null },
      },
      include: {
        movie: true,
      },
    });

    // Group by movie and calculate average rating
    const movieRatings = watchesWithRatings.reduce(
      (acc, watch) => {
        if (!watch.rating) return acc;
        const movieId = watch.movieId;
        if (!acc[movieId]) {
          acc[movieId] = {
            movie: watch.movie,
            ratings: [],
            watchCount: 0,
          };
        }
        acc[movieId]!.ratings.push(watch.rating);
        acc[movieId]!.watchCount += 1;
        return acc;
      },
      {} as Record<
        string,
        {
          movie: { id: string; title: string; releaseYear: number | null };
          ratings: number[];
          watchCount: number;
        }
      >,
    );

    // Calculate averages and sort
    const topRated = Object.values(movieRatings)
      .map((data) => ({
        movie: data.movie,
        averageRating:
          data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length,
        watchCount: data.watchCount,
      }))
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 10);

    return topRated;
  }),

  // Get most watched movies
  getMostWatchedMovies: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const watchGroups = await ctx.db.movieWatch.groupBy({
      by: ["movieId"],
      where: { userId },
      _count: {
        movieId: true,
      },
      orderBy: {
        _count: {
          movieId: "desc",
        },
      },
      take: 10,
    });

    const movieIds = watchGroups.map((g) => g.movieId);
    const movies = await ctx.db.movie.findMany({
      where: {
        id: { in: movieIds },
        userId,
      },
    });

    const movieMap = new Map(movies.map((m) => [m.id, m]));

    return watchGroups
      .map((group) => {
        const movie = movieMap.get(group.movieId);
        if (!movie) return null;
        return {
          movie: {
            id: movie.id,
            title: movie.title,
            releaseYear: movie.releaseYear,
          },
          watchCount: group._count.movieId,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }),

  // Get rewatches statistics
  getRewatchesStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const watchGroups = await ctx.db.movieWatch.groupBy({
      by: ["movieId"],
      where: { userId },
      _count: {
        movieId: true,
      },
    });

    const rewatches = watchGroups.filter((g) => g._count.movieId > 1);
    const totalRewatches = rewatches.reduce(
      (sum, g) => sum + (g._count.movieId - 1),
      0,
    );

    return {
      totalRewatches,
      uniqueRewatchedMovies: rewatches.length,
      totalMovies: watchGroups.length,
      rewatchRate:
        watchGroups.length > 0
          ? (rewatches.length / watchGroups.length) * 100
          : 0,
    };
  }),

  // Get average rating by location
  getRatingByLocation: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const locationGroups = await ctx.db.movieWatch.groupBy({
      by: ["watchLocation"],
      where: {
        userId,
        rating: { not: null },
      },
    });

    const locationRatings = await Promise.all(
      locationGroups.map(async (group) => {
        const avg = await ctx.db.movieWatch.aggregate({
          where: {
            userId,
            watchLocation: group.watchLocation,
            rating: { not: null },
          },
          _avg: { rating: true },
          _count: { rating: true },
        });

        return {
          location: group.watchLocation,
          label: {
            ON_DEMAND: "On Demand / Streaming",
            CINEMA: "Cinema",
            TV: "TV",
            OTHER: "Other",
          }[group.watchLocation],
          averageRating: avg._avg.rating ?? 0,
          count: avg._count.rating ?? 0,
        };
      }),
    );

    return locationRatings.sort((a, b) => b.averageRating - a.averageRating);
  }),

  // Get average rating by streaming service
  getRatingByStreamingService: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const serviceGroups = await ctx.db.movieWatch.groupBy({
      by: ["streamingService"],
      where: {
        userId,
        watchLocation: "ON_DEMAND",
        streamingService: { not: null },
        rating: { not: null },
      },
    });

    const serviceRatings = await Promise.all(
      serviceGroups.map(async (group) => {
        const avg = await ctx.db.movieWatch.aggregate({
          where: {
            userId,
            streamingService: group.streamingService,
            rating: { not: null },
          },
          _avg: { rating: true },
          _count: { rating: true },
        });

        const service = group.streamingService!;

        return {
          service,
          label: STREAMING_SERVICES[service] ?? service.replace(/_/g, " "),
          averageRating: avg._avg.rating ?? 0,
          count: avg._count.rating ?? 0,
        };
      }),
    );

    return serviceRatings
      .filter((s) => s.count > 0)
      .sort((a, b) => b.averageRating - a.averageRating);
  }),

  // Get decade distribution
  getDecadeDistribution: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const watches = await ctx.db.movieWatch.findMany({
      where: { userId },
      include: {
        movie: {
          select: {
            releaseYear: true,
          },
        },
      },
    });

    const decadeGroups = watches.reduce(
      (acc, watch) => {
        const year = watch.movie.releaseYear;
        if (!year) {
          acc["Unknown"] = (acc["Unknown"] ?? 0) + 1;
          return acc;
        }

        const decade = Math.floor(year / 10) * 10;
        const decadeLabel = `${decade}s`;
        acc[decadeLabel] = (acc[decadeLabel] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(decadeGroups)
      .map(([decade, count]) => ({
        decade,
        count,
      }))
      .sort((a, b) => {
        if (a.decade === "Unknown") return 1;
        if (b.decade === "Unknown") return -1;
        return a.decade.localeCompare(b.decade);
      });
  }),

  // Get watch streak statistics
  getWatchStreakStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const watches = await ctx.db.movieWatch.findMany({
      where: { userId },
      select: { watchedAt: true },
      orderBy: { watchedAt: "asc" },
    });

    if (watches.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalDaysWithWatches: 0,
      };
    }

    // Get unique dates
    const uniqueDates = new Set<string>();
    watches.forEach((watch) => {
      const date = new Date(watch.watchedAt);
      date.setHours(0, 0, 0, 0);
      uniqueDates.add(date.toISOString().split("T")[0] ?? "");
    });

    const sortedDates = Array.from(uniqueDates)
      .map((d) => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime());

    // Calculate longest streak
    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = sortedDates[i - 1]!;
      const currDate = sortedDates[i]!;
      const daysDiff =
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    // Calculate current streak (from today backwards)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentStreakDays = 0;
    let checkDate = new Date(today);

    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (uniqueDates.has(dateStr ?? "")) {
        currentStreakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      currentStreak: currentStreakDays,
      longestStreak,
      totalDaysWithWatches: uniqueDates.size,
    };
  }),

  // Get day of week statistics
  getDayOfWeekStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const watches = await ctx.db.movieWatch.findMany({
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
