import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  movieIdSchema,
  idSchema,
  mediaEntryCreateSchema,
  mediaEntryUpdateSchema,
  mediaEntryGetAllSchema,
  mediaEntryCollectionOverviewSchema,
} from "~/lib/api-schemas";

export const mediaEntryRouter = createTRPCRouter({
  // Get all media entries for a movie
  getByMovieId: protectedProcedure
    .input(movieIdSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.mediaEntry.findMany({
        where: {
          movieId: input.movieId,
          userId: ctx.session.user.id,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Create new media entry
  create: protectedProcedure
    .input(mediaEntryCreateSchema)
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

      return await ctx.db.mediaEntry.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  // Update media entry
  update: protectedProcedure
    .input(mediaEntryUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const mediaEntry = await ctx.db.mediaEntry.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });

      if (!mediaEntry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media entry not found",
        });
      }

      return await ctx.db.mediaEntry.update({
        where: { id },
        data: updateData,
      });
    }),

  // Delete media entry
  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const mediaEntry = await ctx.db.mediaEntry.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!mediaEntry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media entry not found",
        });
      }

      return await ctx.db.mediaEntry.delete({
        where: { id: input.id },
      });
    }),

  // Get all media entries for user (for collection overview)
  getAll: protectedProcedure
    .input(mediaEntryGetAllSchema)
    .query(async ({ ctx, input }) => {
      const mediaEntries = await ctx.db.mediaEntry.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input.medium && { medium: input.medium }),
          ...(input.isVirtual !== undefined && { isVirtual: input.isVirtual }),
          ...(input.isRipped !== undefined && { isRipped: input.isRipped }),
        },
        include: {
          movie: true,
        },
        orderBy: { createdAt: "desc" },
        skip: input.skip,
        take: input.limit,
      });

      const total = await ctx.db.mediaEntry.count({
        where: {
          userId: ctx.session.user.id,
          ...(input.medium && { medium: input.medium }),
          ...(input.isVirtual !== undefined && { isVirtual: input.isVirtual }),
          ...(input.isRipped !== undefined && { isRipped: input.isRipped }),
        },
      });

      return {
        mediaEntries,
        total,
        hasMore: input.skip + input.limit < total,
      };
    }),

  // Get collection grouped by movie (all media entries for each movie in one object)
  getCollectionGroupedByMovie: protectedProcedure
    .input(mediaEntryCollectionOverviewSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const where = {
        userId,
        ...(input.search && {
          OR: [
            { title: { contains: input.search, mode: "insensitive" as const } },
            {
              originalTitle: {
                contains: input.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }),
        mediaEntries: {
          some: {
            userId,
            ...(input.medium && { medium: input.medium }),
            ...(input.isVirtual !== undefined && { isVirtual: input.isVirtual }),
            ...(input.isRipped !== undefined && { isRipped: input.isRipped }),
          },
        },
      };

      const [movies, total] = await Promise.all([
        ctx.db.movie.findMany({
          where,
          include: {
            mediaEntries: {
              where: {
                userId,
                ...(input.medium && { medium: input.medium }),
                ...(input.isVirtual !== undefined && {
                  isVirtual: input.isVirtual,
                }),
                ...(input.isRipped !== undefined && { isRipped: input.isRipped }),
              },
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { title: "asc" },
          skip: input.skip,
          take: input.limit,
        }),
        ctx.db.movie.count({ where }),
      ]);

      return {
        groups: movies.map((movie) => ({
          movie,
          mediaEntries: movie.mediaEntries,
        })),
        total,
        hasMore: input.skip + input.limit < total,
      };
    }),

  // Get collection statistics
  getCollectionStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [
      totalEntries,
      totalMovies,
      physicalEntries,
      virtualEntries,
      rippedEntries,
      allEntries,
    ] = await Promise.all([
      ctx.db.mediaEntry.count({
        where: { userId },
      }),
      ctx.db.movie.count({
        where: {
          userId,
          mediaEntries: {
            some: {},
          },
        },
      }),
      ctx.db.mediaEntry.count({
        where: {
          userId,
          isVirtual: false,
        },
      }),
      ctx.db.mediaEntry.count({
        where: {
          userId,
          isVirtual: true,
        },
      }),
      ctx.db.mediaEntry.count({
        where: {
          userId,
          isRipped: true,
        },
      }),
      ctx.db.mediaEntry.findMany({
        where: { userId },
        select: {
          medium: true,
          isVirtual: true,
          isRipped: true,
          createdAt: true,
        },
      }),
    ]);

    // Group by medium
    const mediumGroups = allEntries.reduce(
      (acc, entry) => {
        acc[entry.medium] = (acc[entry.medium] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Calculate entries added this year
    const currentYear = new Date().getFullYear();
    const thisYearEntries = allEntries.filter(
      (entry) => new Date(entry.createdAt).getFullYear() === currentYear,
    ).length;

    // Calculate average entries per movie
    const avgEntriesPerMovie =
      totalMovies > 0 ? totalEntries / totalMovies : 0;

    return {
      totalEntries,
      totalMovies,
      physicalEntries,
      virtualEntries,
      rippedEntries,
      thisYearEntries,
      avgEntriesPerMovie: Math.round(avgEntriesPerMovie * 10) / 10,
      mediumDistribution: Object.entries(mediumGroups).map(([medium, count]) => ({
        medium,
        count,
      })),
    };
  }),

  // Get medium distribution statistics
  getMediumDistribution: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const mediumGroups = await ctx.db.mediaEntry.groupBy({
      by: ["medium"],
      where: { userId },
      _count: {
        medium: true,
      },
      orderBy: {
        _count: {
          medium: "desc",
        },
      },
    });

    const MEDIA_TYPE_LABELS: Record<string, string> = {
      BLURAY: "Blu-ray",
      BLURAY4K: "4K UHD Blu-ray",
      DVD: "DVD",
      DIGITAL: "Digital",
      LASERDISC: "LaserDisc",
      STREAM: "Stream",
      FILE: "File",
      VHS: "VHS",
      OTHER: "Other",
    };

    return mediumGroups.map((group) => ({
      medium: group.medium,
      count: group._count.medium,
      label: MEDIA_TYPE_LABELS[group.medium] ?? group.medium,
    }));
  }),

  // Get physical vs virtual distribution
  getPhysicalVirtualStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [physical, virtual] = await Promise.all([
      ctx.db.mediaEntry.count({
        where: {
          userId,
          isVirtual: false,
        },
      }),
      ctx.db.mediaEntry.count({
        where: {
          userId,
          isVirtual: true,
        },
      }),
    ]);

    return [
      { type: "Physical", count: physical },
      { type: "Virtual", count: virtual },
    ];
  }),

  // Get ripped statistics
  getRippedStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [ripped, unripped] = await Promise.all([
      ctx.db.mediaEntry.count({
        where: {
          userId,
          isRipped: true,
          isVirtual: false, // Only count physical media
        },
      }),
      ctx.db.mediaEntry.count({
        where: {
          userId,
          isRipped: false,
          isVirtual: false, // Only count physical media
        },
      }),
    ]);

    const totalPhysical = ripped + unripped;
    const rippedPercentage =
      totalPhysical > 0 ? (ripped / totalPhysical) * 100 : 0;

    return {
      ripped,
      unripped,
      totalPhysical,
      rippedPercentage: Math.round(rippedPercentage * 10) / 10,
    };
  }),

  // Get collection growth over time
  getCollectionGrowth: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const entries = await ctx.db.mediaEntry.findMany({
      where: { userId },
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by month
    const monthlyGroups = entries.reduce(
      (acc, entry) => {
        const date = new Date(entry.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        acc[monthKey] = (acc[monthKey] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Calculate cumulative growth
    let cumulative = 0;
    const growth = Object.entries(monthlyGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => {
        cumulative += count;
        const [year, monthNum] = month.split("-");
        const date = new Date(
          parseInt(year ?? "0"),
          parseInt(monthNum ?? "1") - 1,
        );
        return {
          month,
          label: date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          count,
          cumulative,
        };
      })
      .slice(-12); // Last 12 months

    return growth;
  }),
});
