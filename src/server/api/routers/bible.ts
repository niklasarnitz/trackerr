import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { BIBLE_BOOKS } from "~/lib/bible-data";
import { BIBLE_VERSE_COUNTS } from "~/lib/bible-verses-data";
import { TRPCError } from "@trpc/server";

export const bibleRouter = createTRPCRouter({
  logReading: protectedProcedure
    .input(
      z.object({
        bookId: z.string(),
        chapter: z.number().int().min(1),
        startVerse: z.number().int().min(1).optional(),
        endVerse: z.number().int().min(1).optional(),
        date: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const book = BIBLE_BOOKS.find((b) => b.id === input.bookId);
      if (!book) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid book ID",
        });
      }
      
      if (input.chapter > book.chapters) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invalid chapter ${input.chapter} for book ${book.name}`,
        });
      }

      let { startVerse, endVerse } = input;

      // If full chapter read (no start/end specified), determine the range
      if (!startVerse && !endVerse) {
        const chapterVerses = BIBLE_VERSE_COUNTS[input.bookId]?.[input.chapter - 1];
        if (chapterVerses) {
          startVerse = 1;
          endVerse = chapterVerses;
        }
      }

      return await ctx.db.bibleReadingEntry.create({
        data: {
          userId: ctx.session.user.id,
          bookId: input.bookId,
          chapter: input.chapter,
          startVerse,
          endVerse,
          date: input.date,
        },
      });
    }),

  updateReading: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        bookId: z.string(),
        chapter: z.number().int().min(1),
        startVerse: z.number().int().min(1).optional(),
        endVerse: z.number().int().min(1).optional(),
        date: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const book = BIBLE_BOOKS.find((b) => b.id === input.bookId);
      if (!book) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid book ID",
        });
      }
      
      if (input.chapter > book.chapters) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invalid chapter ${input.chapter} for book ${book.name}`,
        });
      }

      return await ctx.db.bibleReadingEntry.update({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          bookId: input.bookId,
          chapter: input.chapter,
          startVerse: input.startVerse,
          endVerse: input.endVerse,
          date: input.date,
        },
      });
    }),

  removeReading: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.bibleReadingEntry.deleteMany({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),

  getReadings: protectedProcedure
    .input(
      z.object({
        bookId: z.string().optional(),
        limit: z.number().min(1).max(100).default(5),
        cursor: z.string().optional(), // ID of the last item
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 5;
      const { cursor } = input ?? {};

      const items = await ctx.db.bibleReadingEntry.findMany({
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        where: { 
          userId: ctx.session.user.id,
          ...(input?.bookId ? { bookId: input.bookId } : {}),
        },
        orderBy: [{ date: "desc" }, { id: "desc" }],
        cursor: cursor ? { id: cursor } : undefined,
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  getProgress: protectedProcedure.query(async ({ ctx }) => {
    const readings = await ctx.db.bibleReadingEntry.findMany({
      where: { userId: ctx.session.user.id },
    });

    // bookId -> chapter -> Set of unique read verses
    const uniqueStats: Record<string, Record<number, Set<number>>> = {};
    // bookId -> chapter -> Total count of verses read (accumulated)
    const intensityStats: Record<string, Record<number, number>> = {};
    
    for (const entry of readings) {
      if (!uniqueStats[entry.bookId]) {
        uniqueStats[entry.bookId] = {};
        intensityStats[entry.bookId] = {};
      }
      const bookUnique = uniqueStats[entry.bookId]!;
      const bookIntensity = intensityStats[entry.bookId]!;
      
      if (!bookUnique[entry.chapter]) {
        bookUnique[entry.chapter] = new Set();
      }
      if (!bookIntensity[entry.chapter]) {
        bookIntensity[entry.chapter] = 0;
      }

      // Determine range
      let start = entry.startVerse;
      let end = entry.endVerse;

      // Fallback for legacy data
      if (!start || !end) {
        const total = BIBLE_VERSE_COUNTS[entry.bookId]?.[entry.chapter - 1] ?? 0;
        if (!start) start = 1;
        if (!end) end = total;
      }

      // Add verses to stats
      if (start && end && end >= start) {
        const count = end - start + 1;
        
        // 1. Accumulate total verses read for intensity/completion count
        bookIntensity[entry.chapter] += count;

        // 2. Track unique verses for percentage
        for (let i = start; i <= end; i++) {
          bookUnique[entry.chapter]!.add(i);
        }
      }
    }

    const bookProgress = BIBLE_BOOKS.map((book) => {
      const bookUnique = uniqueStats[book.id] ?? {};
      const bookIntensity = intensityStats[book.id] ?? {};
      
      const chaptersList = BIBLE_VERSE_COUNTS[book.id] ?? [];
      const totalVersesInBook = chaptersList.reduce((a, b) => a + b, 0);

      // Calculate stats
      let uniqueVersesRead = 0;
      let totalAccumulatedVerses = 0;

      const verseStats: Record<number, { read: number; total: number }> = {};
      const chapterStats: Record<number, number> = {}; // Now stores "Intensity" (0.5, 1.0, 2.5 etc)

      chaptersList.forEach((totalVerses, index) => {
        const chapterNum = index + 1;
        
        const uniqueCount = bookUnique[chapterNum]?.size ?? 0;
        const accumulatedCount = bookIntensity[chapterNum] ?? 0;

        uniqueVersesRead += uniqueCount;
        totalAccumulatedVerses += accumulatedCount;

        verseStats[chapterNum] = { read: uniqueCount, total: totalVerses };
        
        // Intensity = Accumulated Reads / Total Verses in Chapter
        // e.g. Read 10/10 verses once -> 1.0
        // e.g. Read 5/10 verses once -> 0.5
        // e.g. Read 10/10 verses twice -> 2.0
        chapterStats[chapterNum] = totalVerses > 0 ? accumulatedCount / totalVerses : 0;
      });

      const uniqueChaptersRead = Object.keys(bookUnique).length;
      
      // Percentage is based on UNIQUE coverage (0-100%)
      const percentage = totalVersesInBook > 0 ? Math.min((uniqueVersesRead / totalVersesInBook) * 100, 100) : 0;
      
      // Completion count is based on TOTAL ACCUMULATED verses (can be > 1)
      const completionCount = totalVersesInBook > 0 ? Math.floor(totalAccumulatedVerses / totalVersesInBook) : 0;

      return {
        ...book,
        uniqueChaptersRead,
        percentage,
        completionCount,
        chapterStats, // Now represents intensity
        verseStats,
      };
    });

    // Global stats
    const totalVersesInBible = Object.values(BIBLE_VERSE_COUNTS)
      .flat()
      .reduce((a, b) => a + b, 0);
      
    // Summing unique verses from the calculated book progress
    const totalUniqueVersesRead = bookProgress.reduce((acc, b) => {
       const bookUnique = uniqueStats[b.id] ?? {};
       let v = 0;
       Object.values(bookUnique).forEach(s => v += s.size);
       return acc + v;
    }, 0);

    const overallPercentage = totalVersesInBible > 0 ? (totalUniqueVersesRead / totalVersesInBible) * 100 : 0;
    const totalUniqueChaptersRead = bookProgress.reduce((acc, b) => acc + b.uniqueChaptersRead, 0);
    const totalChaptersInBible = BIBLE_BOOKS.reduce((acc, b) => acc + b.chapters, 0);

    return {
      bookProgress,
      overallPercentage,
      totalUniqueChaptersRead,
      totalChaptersInBible,
    };
  }),
});