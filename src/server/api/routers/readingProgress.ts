import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  readingProgressCreateSchema,
  readingProgressGetByBookSchema,
  idSchema,
} from "~/lib/api-schemas";

export const readingProgressRouter = createTRPCRouter({
  // Get reading progress for a book
  getByBook: protectedProcedure
    .input(readingProgressGetByBookSchema)
    .query(async ({ ctx, input }) => {
      // Verify book belongs to user
      const book = await ctx.db.book.findFirst({
        where: {
          id: input.bookId,
          userId: ctx.session.user.id,
        },
      });

      if (!book) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Book not found",
        });
      }

      return await ctx.db.readingProgress.findMany({
        where: {
          bookId: input.bookId,
          userId: ctx.session.user.id,
        },
        orderBy: { createdAt: "asc" },
      });
    }),

  // Create reading progress entry
  create: protectedProcedure
    .input(readingProgressCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify book belongs to user
      const book = await ctx.db.book.findFirst({
        where: {
          id: input.bookId,
          userId: ctx.session.user.id,
        },
      });

      if (!book) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Book not found",
        });
      }

      // Validate pages read doesn't exceed total pages
      if (book.pages && input.pagesRead > book.pages) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Pages read cannot exceed total pages",
        });
      }

      // Determine new status based on pages read
      let newStatus: "UNREAD" | "READING" | "READ" = "READING";
      if (input.pagesRead === 0) {
        newStatus = "UNREAD";
      } else if (book.pages && input.pagesRead >= book.pages) {
        newStatus = "READ";
      }

      // Create progress entry and update book status in a transaction
      const [progress] = await ctx.db.$transaction([
        ctx.db.readingProgress.create({
          data: {
            bookId: input.bookId,
            userId: ctx.session.user.id,
            pagesRead: input.pagesRead,
          },
        }),
        ctx.db.book.update({
          where: { id: input.bookId },
          data: { status: newStatus },
        }),
      ]);

      return progress;
    }),

  // Delete reading progress entry
  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const progress = await ctx.db.readingProgress.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          book: true,
        },
      });

      if (!progress) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reading progress not found",
        });
      }

      await ctx.db.readingProgress.delete({
        where: { id: input.id },
      });

      // Recalculate book status based on remaining progress
      const remainingProgress = await ctx.db.readingProgress.findMany({
        where: {
          bookId: progress.bookId,
          userId: ctx.session.user.id,
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      });

      let newStatus: "UNREAD" | "READING" | "READ" = "UNREAD";
      if (remainingProgress.length > 0) {
        const latestPages = remainingProgress[0]!.pagesRead;
        const totalPages = progress.book.pages;

        if (latestPages === 0) {
          newStatus = "UNREAD";
        } else if (totalPages && latestPages >= totalPages) {
          newStatus = "READ";
        } else {
          newStatus = "READING";
        }
      }

      await ctx.db.book.update({
        where: { id: progress.bookId },
        data: { status: newStatus },
      });

      return { success: true };
    }),
});
