import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { quoteSchema } from "~/lib/api-schemas";
import { TRPCError } from "@trpc/server";

export const quoteRouter = createTRPCRouter({
  getBookQuotes: protectedProcedure
    .input(z.object({ bookId: z.string() }))
    .query(async ({ ctx, input }) => {
      const quotes = await ctx.db.quote.findMany({
        where: {
          bookId: input.bookId,
          userId: ctx.session.user.id,
        },
        orderBy: {
          pageStart: "asc",
        },
      });
      return { quotes };
    }),

  create: protectedProcedure
    .input(quoteSchema)
    .mutation(async ({ ctx, input }) => {
      const { bookId, ...quoteData } = input;

      // Verify book belongs to user
      const book = await ctx.db.book.findFirst({
        where: {
          id: bookId,
          userId: ctx.session.user.id,
        },
      });

      if (!book) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Book not found",
        });
      }

      return ctx.db.quote.create({
        data: {
          ...quoteData,
          book: {
            connect: { id: bookId },
          },
          user: {
            connect: { id: ctx.session.user.id },
          },
        },
      });
    }),

  update: protectedProcedure
    .input(quoteSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, bookId, ...quoteData } = input;

      const existingQuote = await ctx.db.quote.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingQuote) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quote not found",
        });
      }

      return ctx.db.quote.update({
        where: {
          id,
        },
        data: quoteData,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingQuote = await ctx.db.quote.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingQuote) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quote not found",
        });
      }

      return ctx.db.quote.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
