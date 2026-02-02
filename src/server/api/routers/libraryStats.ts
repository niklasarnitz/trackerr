import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const roundToOne = (value: number) => Math.round(value * 10) / 10;

export const libraryStatsRouter = createTRPCRouter({
  getOverview: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [
      tagRows,
      totalMovieTags,
      totalBookTags,
      totalTvShowTags,
      totalLists,
      publicLists,
      totalListEntries,
      topLists,
      totalLoans,
      activeLoans,
      returnedLoanRows,
      totalQuotes,
      topQuotedBooksRaw,
      quoteBookIds,
      totalProgressEntries,
      progressAvg,
      progressBookIds,
      booksInProgress,
      totalBibleReadings,
      bibleBookIds,
      bibleDays,
    ] = await Promise.all([
      ctx.db.tag.findMany({
        where: { userId },
        include: {
          _count: {
            select: { movieTags: true, bookTags: true, tvShowTags: true },
          },
        },
      }),
      ctx.db.movieTag.count({ where: { movie: { userId } } }),
      ctx.db.bookTag.count({ where: { book: { userId } } }),
      ctx.db.tvShowTag.count({ where: { tvShow: { userId } } }),
      ctx.db.movieList.count({ where: { userId } }),
      ctx.db.movieList.count({ where: { userId, isPublic: true } }),
      ctx.db.movieListEntry.count({ where: { movieList: { userId } } }),
      ctx.db.movieList.findMany({
        where: { userId },
        include: { _count: { select: { listEntries: true } } },
        orderBy: { listEntries: { _count: "desc" } },
        take: 5,
      }),
      ctx.db.loan.count({ where: { mediaEntry: { userId } } }),
      ctx.db.loan.count({
        where: { mediaEntry: { userId }, returnedAt: null },
      }),
      ctx.db.loan.findMany({
        where: { mediaEntry: { userId }, returnedAt: { not: null } },
        select: { loanedAt: true, returnedAt: true },
      }),
      ctx.db.quote.count({ where: { userId } }),
      ctx.db.quote.groupBy({
        by: ["bookId"],
        where: { userId },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
      ctx.db.quote.findMany({
        where: { userId },
        distinct: ["bookId"],
        select: { bookId: true },
      }),
      ctx.db.readingProgress.count({ where: { userId } }),
      ctx.db.readingProgress.aggregate({
        where: { userId },
        _avg: { pagesRead: true },
      }),
      ctx.db.readingProgress.findMany({
        where: { userId },
        distinct: ["bookId"],
        select: { bookId: true },
      }),
      ctx.db.book.count({ where: { userId, status: "READING" } }),
      ctx.db.bibleReadingEntry.count({ where: { userId } }),
      ctx.db.bibleReadingEntry.findMany({
        where: { userId },
        distinct: ["bookId"],
        select: { bookId: true },
      }),
      ctx.db.bibleReadingEntry.findMany({
        where: { userId },
        distinct: ["date"],
        select: { date: true },
      }),
    ]);

    const tagsWithUsage = tagRows.map((tag) => {
      const totalUses =
        tag._count.movieTags + tag._count.bookTags + tag._count.tvShowTags;
      return {
        name: tag.name,
        totalUses,
      };
    });

    const topTags = tagsWithUsage
      .filter((tag) => tag.totalUses > 0)
      .sort((a, b) => b.totalUses - a.totalUses)
      .slice(0, 5);

    const totalTagUses = totalMovieTags + totalBookTags + totalTvShowTags;

    const avgListSize = totalLists > 0 ? totalListEntries / totalLists : 0;

    const avgLoanDurationDays =
      returnedLoanRows.length === 0
        ? 0
        : roundToOne(
            returnedLoanRows.reduce((sum, loan) => {
              const returnedAt = loan.returnedAt ?? new Date();
              const diffMs = returnedAt.getTime() - loan.loanedAt.getTime();
              return sum + diffMs / (1000 * 60 * 60 * 24);
            }, 0) / returnedLoanRows.length,
          );

    const quoteBookIdsSet = new Set(quoteBookIds.map((item) => item.bookId));
    const quoteBooks =
      topQuotedBooksRaw.length === 0
        ? []
        : await ctx.db.book.findMany({
            where: { id: { in: topQuotedBooksRaw.map((item) => item.bookId) } },
            select: { id: true, title: true },
          });

    const quoteBookMap = new Map(quoteBooks.map((book) => [book.id, book]));

    const topQuotedBooks = topQuotedBooksRaw.map((item) => ({
      title: quoteBookMap.get(item.bookId)?.title ?? "Unknown",
      count: item._count.id,
    }));

    return {
      tags: {
        totalTags: tagRows.length,
        totalMovieTags,
        totalBookTags,
        totalTvShowTags,
        totalTagUses,
        topTags,
      },
      lists: {
        totalLists,
        publicLists,
        totalEntries: totalListEntries,
        avgListSize: roundToOne(avgListSize),
        topLists: topLists.map((list) => ({
          id: list.id,
          name: list.name,
          size: list._count.listEntries,
        })),
      },
      loans: {
        totalLoans,
        activeLoans,
        returnedLoans: totalLoans - activeLoans,
        avgLoanDurationDays,
      },
      quotes: {
        totalQuotes,
        booksWithQuotes: quoteBookIdsSet.size,
        topBooks: topQuotedBooks,
      },
      readingProgress: {
        totalEntries: totalProgressEntries,
        booksWithProgress: progressBookIds.length,
        booksInProgress,
        avgPagesRead: roundToOne(progressAvg._avg.pagesRead ?? 0),
      },
      bible: {
        totalReadings: totalBibleReadings,
        uniqueBooks: bibleBookIds.length,
        readingDays: bibleDays.length,
      },
    };
  }),
});
