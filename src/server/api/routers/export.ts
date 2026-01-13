import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const exportRouter = createTRPCRouter({
  // Export all user data as JSON
  exportData: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [movies, watches, mediaEntries, tags, lists, loans] =
      await Promise.all([
        ctx.db.movie.findMany({
          where: { userId },
          include: {
            movieTags: {
              include: {
                tag: true,
              },
            },
            listEntries: {
              include: {
                movieList: true,
              },
            },
          },
        }),
        ctx.db.movieWatch.findMany({
          where: { userId },
          include: {
            movie: {
              select: {
                id: true,
                title: true,
                tmdbId: true,
              },
            },
            cinemaWatchMetadata: true,
          },
        }),
        ctx.db.mediaEntry.findMany({
          where: { userId },
          include: {
            movie: {
              select: {
                id: true,
                title: true,
                tmdbId: true,
              },
            },
            loan: true,
          },
        }),
        ctx.db.tag.findMany({
          where: { userId },
        }),
        ctx.db.movieList.findMany({
          where: { userId },
          include: {
            listEntries: {
              include: {
                movie: {
                  select: {
                    id: true,
                    title: true,
                    tmdbId: true,
                  },
                },
              },
            },
          },
        }),
        ctx.db.loan.findMany({
          where: {
            mediaEntry: {
              userId,
            },
          },
          include: {
            mediaEntry: {
              include: {
                movie: {
                  select: {
                    id: true,
                    title: true,
                    tmdbId: true,
                  },
                },
              },
            },
          },
        }),
      ]);

    return {
      exportDate: new Date().toISOString(),
      movies,
      watches,
      mediaEntries,
      tags,
      lists,
      loans,
    };
  }),

  // Export as CSV (simplified version)
  exportCSV: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const movies = await ctx.db.movie.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            watches: true,
            mediaEntries: true,
          },
        },
      },
    });

    // Convert to CSV format
    const headers = [
      "Title",
      "Original Title",
      "Release Year",
      "Runtime",
      "Genres",
      "Director",
      "Is Favorite",
      "Is In Watchlist",
      "Watch Count",
      "Media Entry Count",
      "Notes",
    ];

    const rows = movies.map((movie) => [
      movie.title,
      movie.originalTitle ?? "",
      movie.releaseYear?.toString() ?? "",
      movie.runtime?.toString() ?? "",
      movie.genres.join("; "),
      movie.director ?? "",
      movie.isFavorite ? "Yes" : "No",
      movie.isInWatchlist ? "Yes" : "No",
      movie._count.watches.toString(),
      movie._count.mediaEntries.toString(),
      movie.notes ?? "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    return {
      filename: `trackerr-export-${new Date().toISOString().split("T")[0]}.csv`,
      content: csvContent,
    };
  }),
});
